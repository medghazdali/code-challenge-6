// Skip tests if aws-sdk-client-mock is not installed
let mockClient;
let hasMockClient = false;
try {
  mockClient = require('aws-sdk-client-mock').mockClient;
  hasMockClient = true;
} catch (e) {
  console.warn('aws-sdk-client-mock not installed. Run: npm install');
  console.warn('DynamoDB tests will be skipped. Install dependency to run these tests.');
  // Create a no-op mock that will cause tests to be skipped
  mockClient = () => ({
    on: () => ({ resolves: () => {}, rejects: () => {} }),
    reset: () => {},
    restore: () => {},
    calls: () => [],
    call: () => ({ args: [{ input: {} }] }),
  });
}
const { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const {
  createProject,
  getProjectById,
  listProjectsByUserId,
  updateProject,
  deleteProject,
  createTask,
  getTaskById,
  listTasks,
  listTasksByProjectId,
  updateTask,
  deleteTask,
} = require('../../../lib/dynamodb');
const { createMockProject, createMockTask } = require('../../helpers/test-helpers');

// Mock DynamoDB Document Client
const ddbMock = mockClient(DynamoDBDocumentClient);

// Skip entire test suite if aws-sdk-client-mock is not available
const describeOrSkip = hasMockClient ? describe : describe.skip;

describeOrSkip('DynamoDB Helper Functions - Projects', () => {
  beforeEach(() => {
    if (hasMockClient) {
      ddbMock.reset();
    }
    process.env.PROJECTS_TABLE = 'projects-test';
  });

  afterEach(() => {
    if (hasMockClient) {
      ddbMock.restore();
    }
  });

  describe('createProject', () => {
    it('should create a project successfully', async () => {
      const projectData = createMockProject();
      ddbMock.on(PutCommand).resolves({});

      const result = await createProject(projectData);

      expect(result).toEqual(projectData);
      expect(ddbMock.calls()).toHaveLength(1);
      const putCall = ddbMock.call(0).args[0].input;
      expect(putCall.TableName).toBe('projects-test');
      expect(putCall.Item).toEqual(projectData);
    });

    it('should throw error on DynamoDB failure', async () => {
      const projectData = createMockProject();
      ddbMock.on(PutCommand).rejects(new Error('DynamoDB error'));

      await expect(createProject(projectData)).rejects.toThrow('Failed to create project: DynamoDB error');
    });

    it('should use default table name if PROJECTS_TABLE not set', async () => {
      delete process.env.PROJECTS_TABLE;
      const projectData = createMockProject();
      ddbMock.on(PutCommand).resolves({});

      await createProject(projectData);

      const putCall = ddbMock.call(0).args[0].input;
      expect(putCall.TableName).toBe('projects-dev');
    });
  });

  describe('getProjectById', () => {
    it('should get a project by ID successfully', async () => {
      const project = createMockProject();
      ddbMock.on(GetCommand).resolves({ Item: project });

      const result = await getProjectById('project-id-123');

      expect(result).toEqual(project);
      expect(ddbMock.calls()).toHaveLength(1);
      const getCall = ddbMock.call(0).args[0].input;
      expect(getCall.TableName).toBe('projects-test');
      expect(getCall.Key.id).toBe('project-id-123');
    });

    it('should return null when project not found', async () => {
      ddbMock.on(GetCommand).resolves({});

      const result = await getProjectById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should throw error on DynamoDB failure', async () => {
      ddbMock.on(GetCommand).rejects(new Error('DynamoDB error'));

      await expect(getProjectById('project-id-123')).rejects.toThrow('Failed to get project: DynamoDB error');
    });
  });

  describe('listProjectsByUserId', () => {
    it('should list projects by userId successfully', async () => {
      const projects = [createMockProject({ id: 'p1' }), createMockProject({ id: 'p2' })];
      ddbMock.on(QueryCommand).resolves({ Items: projects, Count: 2 });

      const result = await listProjectsByUserId('user-123');

      expect(result.items).toEqual(projects);
      expect(result.count).toBe(2);
      const queryCall = ddbMock.call(0).args[0].input;
      expect(queryCall.TableName).toBe('projects-test');
      expect(queryCall.IndexName).toBe('userId-index');
      expect(queryCall.KeyConditionExpression).toBe('userId = :userId');
      expect(queryCall.ExpressionAttributeValues[':userId']).toBe('user-123');
    });

    it('should handle pagination with lastEvaluatedKey', async () => {
      const projects = [createMockProject()];
      ddbMock.on(QueryCommand).resolves({ Items: projects, Count: 1, LastEvaluatedKey: { id: 'last-key' } });

      const result = await listProjectsByUserId('user-123', 10, { id: 'last-key' });

      expect(result.items).toEqual(projects);
      const queryCall = ddbMock.call(0).args[0].input;
      expect(queryCall.ExclusiveStartKey).toEqual({ id: 'last-key' });
    });

    it('should return empty array when no projects found', async () => {
      ddbMock.on(QueryCommand).resolves({ Items: [], Count: 0 });

      const result = await listProjectsByUserId('user-123');

      expect(result.items).toEqual([]);
      expect(result.count).toBe(0);
    });

    it('should throw error on DynamoDB failure', async () => {
      ddbMock.on(QueryCommand).rejects(new Error('DynamoDB error'));

      await expect(listProjectsByUserId('user-123')).rejects.toThrow('Failed to list projects: DynamoDB error');
    });
  });

  describe('updateProject', () => {
    it('should update a project successfully', async () => {
      const updatedProject = createMockProject({ name: 'Updated Name' });
      ddbMock.on(UpdateCommand).resolves({ Attributes: updatedProject });

      const result = await updateProject('project-id-123', { name: 'Updated Name' });

      expect(result).toEqual(updatedProject);
      const updateCall = ddbMock.call(0).args[0].input;
      expect(updateCall.TableName).toBe('projects-test');
      expect(updateCall.Key.id).toBe('project-id-123');
      expect(updateCall.UpdateExpression).toContain('SET');
    });

    it('should not update id or userId fields', async () => {
      ddbMock.on(UpdateCommand).resolves({ Attributes: createMockProject() });

      await updateProject('project-id-123', { id: 'new-id', userId: 'new-user', name: 'New Name' });

      const updateCall = ddbMock.call(0).args[0].input;
      const expressionAttributeNames = updateCall.ExpressionAttributeNames;
      expect(expressionAttributeNames).not.toHaveProperty('#attr0', 'id');
      expect(expressionAttributeNames).not.toHaveProperty('#attr0', 'userId');
    });

    it('should return null on ResourceNotFoundException', async () => {
      const error = new Error('Resource not found');
      error.name = 'ResourceNotFoundException';
      ddbMock.on(UpdateCommand).rejects(error);

      const result = await updateProject('non-existent-id', { name: 'New Name' });

      expect(result).toBeNull();
    });

    it('should throw error on other DynamoDB failures', async () => {
      ddbMock.on(UpdateCommand).rejects(new Error('DynamoDB error'));

      await expect(updateProject('project-id-123', { name: 'New Name' })).rejects.toThrow('Failed to update project: DynamoDB error');
    });
  });

  describe('deleteProject', () => {
    it('should delete a project successfully', async () => {
      const project = createMockProject();
      ddbMock.on(DeleteCommand).resolves({ Attributes: project });

      const result = await deleteProject('project-id-123');

      expect(result).toEqual(project);
      const deleteCall = ddbMock.call(0).args[0].input;
      expect(deleteCall.TableName).toBe('projects-test');
      expect(deleteCall.Key.id).toBe('project-id-123');
    });

    it('should return null when project not found', async () => {
      ddbMock.on(DeleteCommand).resolves({});

      const result = await deleteProject('non-existent-id');

      expect(result).toBeNull();
    });

    it('should throw error on DynamoDB failure', async () => {
      ddbMock.on(DeleteCommand).rejects(new Error('DynamoDB error'));

      await expect(deleteProject('project-id-123')).rejects.toThrow('Failed to delete project: DynamoDB error');
    });
  });
});

describeOrSkip('DynamoDB Helper Functions - Tasks', () => {
  beforeEach(() => {
    if (hasMockClient) {
      ddbMock.reset();
    }
    process.env.TASKS_TABLE = 'tasks-test';
  });

  afterEach(() => {
    if (hasMockClient) {
      ddbMock.restore();
    }
  });

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const taskData = createMockTask();
      ddbMock.on(PutCommand).resolves({});

      const result = await createTask(taskData);

      expect(result).toEqual(taskData);
      expect(ddbMock.calls()).toHaveLength(1);
      const putCall = ddbMock.call(0).args[0].input;
      expect(putCall.TableName).toBe('tasks-test');
      expect(putCall.Item).toEqual(taskData);
    });

    it('should throw error on DynamoDB failure', async () => {
      const taskData = createMockTask();
      ddbMock.on(PutCommand).rejects(new Error('DynamoDB error'));

      await expect(createTask(taskData)).rejects.toThrow('Failed to create task: DynamoDB error');
    });
  });

  describe('getTaskById', () => {
    it('should get a task by ID successfully', async () => {
      const task = createMockTask();
      ddbMock.on(GetCommand).resolves({ Item: task });

      const result = await getTaskById('task-id-123');

      expect(result).toEqual(task);
      const getCall = ddbMock.call(0).args[0].input;
      expect(getCall.TableName).toBe('tasks-test');
      expect(getCall.Key.id).toBe('task-id-123');
    });

    it('should return null when task not found', async () => {
      ddbMock.on(GetCommand).resolves({});

      const result = await getTaskById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('listTasks', () => {
    it('should list all tasks successfully', async () => {
      const tasks = [createMockTask({ id: 't1' }), createMockTask({ id: 't2' })];
      ddbMock.on(ScanCommand).resolves({ Items: tasks, Count: 2 });

      const result = await listTasks();

      expect(result.items).toEqual(tasks);
      expect(result.count).toBe(2);
      const scanCall = ddbMock.call(0).args[0].input;
      expect(scanCall.TableName).toBe('tasks-test');
    });

    it('should handle pagination', async () => {
      const tasks = [createMockTask()];
      ddbMock.on(ScanCommand).resolves({ Items: tasks, Count: 1, LastEvaluatedKey: { id: 'last-key' } });

      const result = await listTasks(10, { id: 'last-key' });

      expect(result.items).toEqual(tasks);
      const scanCall = ddbMock.call(0).args[0].input;
      expect(scanCall.ExclusiveStartKey).toEqual({ id: 'last-key' });
    });
  });

  describe('listTasksByProjectId', () => {
    it('should list tasks by projectId successfully', async () => {
      const tasks = [createMockTask(), createMockTask({ id: 't2' })];
      ddbMock.on(QueryCommand).resolves({ Items: tasks, Count: 2 });

      const result = await listTasksByProjectId('project-id-123');

      expect(result.items).toEqual(tasks);
      const queryCall = ddbMock.call(0).args[0].input;
      expect(queryCall.TableName).toBe('tasks-test');
      expect(queryCall.IndexName).toBe('projectId-index');
      expect(queryCall.KeyConditionExpression).toBe('projectId = :projectId');
    });
  });

  describe('updateTask', () => {
    it('should update a task successfully', async () => {
      const updatedTask = createMockTask({ status: 'completed' });
      ddbMock.on(UpdateCommand).resolves({ Attributes: updatedTask });

      const result = await updateTask('task-id-123', { status: 'completed' });

      expect(result).toEqual(updatedTask);
      const updateCall = ddbMock.call(0).args[0].input;
      expect(updateCall.TableName).toBe('tasks-test');
      expect(updateCall.Key.id).toBe('task-id-123');
    });

    it('should return null on ResourceNotFoundException', async () => {
      const error = new Error('Resource not found');
      error.name = 'ResourceNotFoundException';
      ddbMock.on(UpdateCommand).rejects(error);

      const result = await updateTask('non-existent-id', { status: 'completed' });

      expect(result).toBeNull();
    });
  });

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      const task = createMockTask();
      ddbMock.on(DeleteCommand).resolves({ Attributes: task });

      const result = await deleteTask('task-id-123');

      expect(result).toEqual(task);
      const deleteCall = ddbMock.call(0).args[0].input;
      expect(deleteCall.TableName).toBe('tasks-test');
      expect(deleteCall.Key.id).toBe('task-id-123');
    });

    it('should return null when task not found', async () => {
      ddbMock.on(DeleteCommand).resolves({});

      const result = await deleteTask('non-existent-id');

      expect(result).toBeNull();
    });
  });
});

