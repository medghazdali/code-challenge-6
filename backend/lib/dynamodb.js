const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, QueryCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

// Initialize DynamoDB Client
const getDynamoDBClient = () => {
  const region = process.env.AWS_REGION || process.env.REGION || 'eu-north-1';
  console.log('DynamoDB Region:', region);
  const clientConfig = {
    region: region,
  };

  // Support for DynamoDB Local
  if (process.env.AWS_ENDPOINT_URL) {
    clientConfig.endpoint = process.env.AWS_ENDPOINT_URL;
    // For local development, credentials are not required
    clientConfig.credentials = {
      accessKeyId: 'local',
      secretAccessKey: 'local',
    };
  } else if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    // Explicitly set credentials from environment variables
    clientConfig.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
  }
  // If no credentials are provided, AWS SDK will try to load from default credential chain
  // (IAM roles, AWS CLI config, etc.)

  const client = new DynamoDBClient(clientConfig);
  return DynamoDBDocumentClient.from(client);
};

// Create a new task
const createTask = async (taskData) => {
  const docClient = getDynamoDBClient();
  const tableName = process.env.TASKS_TABLE || 'tasks-dev';
  const command = new PutCommand({
    TableName: tableName,
    Item: taskData,
  });

  try {
    await docClient.send(command);
    return taskData;
  } catch (error) {
    console.error('Error creating task:', error);
    throw new Error(`Failed to create task: ${error.message}`);
  }
};

// Get a task by ID
const getTaskById = async (id) => {
  const docClient = getDynamoDBClient();
  const tableName = process.env.TASKS_TABLE || 'tasks-dev';
  const command = new GetCommand({
    TableName: tableName,
    Key: {
      id: id,
    },
  });

  try {
    const result = await docClient.send(command);
    return result.Item || null;
  } catch (error) {
    console.error('Error getting task:', error);
    throw new Error(`Failed to get task: ${error.message}`);
  }
};

// List all tasks (with optional pagination)
const listTasks = async (limit = 100, lastEvaluatedKey = null) => {
  const docClient = getDynamoDBClient();
  const tableName = process.env.TASKS_TABLE || 'tasks-dev';
  console.log('Using DynamoDB table:', tableName);
  const params = {
    TableName: tableName,
    Limit: limit,
  };

  if (lastEvaluatedKey) {
    params.ExclusiveStartKey = lastEvaluatedKey;
  }

  try {
    const command = new ScanCommand(params);
    const result = await docClient.send(command);
    return {
      items: result.Items || [],
      lastEvaluatedKey: result.LastEvaluatedKey,
      count: result.Count,
    };
  } catch (error) {
    console.error('Error listing tasks:', error);
    throw new Error(`Failed to list tasks: ${error.message}`);
  }
};

// Update a task
const updateTask = async (id, updateData) => {
  const docClient = getDynamoDBClient();

  // Build update expression
  const updateExpressions = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  Object.keys(updateData).forEach((key, index) => {
    if (key !== 'id') {
      const attrName = `#attr${index}`;
      const attrValue = `:val${index}`;
      updateExpressions.push(`${attrName} = ${attrValue}`);
      expressionAttributeNames[attrName] = key;
      expressionAttributeValues[attrValue] = updateData[key];
    }
  });

  // Always update the updatedAt timestamp
  const updatedAtAttr = `#attr${updateExpressions.length}`;
  const updatedAtVal = `:val${updateExpressions.length}`;
  updateExpressions.push(`${updatedAtAttr} = ${updatedAtVal}`);
  expressionAttributeNames[updatedAtAttr] = 'updatedAt';
  expressionAttributeValues[updatedAtVal] = new Date().toISOString();

  const tableName = process.env.TASKS_TABLE || 'tasks-dev';
  const command = new UpdateCommand({
    TableName: tableName,
    Key: {
      id: id,
    },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  });

  try {
    const result = await docClient.send(command);
    return result.Attributes;
  } catch (error) {
    if (error.name === 'ResourceNotFoundException' || error.name === 'ValidationException') {
      return null;
    }
    console.error('Error updating task:', error);
    throw new Error(`Failed to update task: ${error.message}`);
  }
};

// Delete a task
const deleteTask = async (id) => {
  const docClient = getDynamoDBClient();
  const tableName = process.env.TASKS_TABLE || 'tasks-dev';
  const command = new DeleteCommand({
    TableName: tableName,
    Key: {
      id: id,
    },
    ReturnValues: 'ALL_OLD',
  });

  try {
    const result = await docClient.send(command);
    return result.Attributes || null;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw new Error(`Failed to delete task: ${error.message}`);
  }
};

// ========== PROJECTS FUNCTIONS ==========

// Create a new project
const createProject = async (projectData) => {
  const docClient = getDynamoDBClient();
  const tableName = process.env.PROJECTS_TABLE || 'projects-dev';
  const command = new PutCommand({
    TableName: tableName,
    Item: projectData,
  });

  try {
    await docClient.send(command);
    return projectData;
  } catch (error) {
    console.error('Error creating project:', error);
    throw new Error(`Failed to create project: ${error.message}`);
  }
};

// Get a project by ID
const getProjectById = async (id) => {
  const docClient = getDynamoDBClient();
  const tableName = process.env.PROJECTS_TABLE || 'projects-dev';
  const command = new GetCommand({
    TableName: tableName,
    Key: {
      id: id,
    },
  });

  try {
    const result = await docClient.send(command);
    return result.Item || null;
  } catch (error) {
    console.error('Error getting project:', error);
    throw new Error(`Failed to get project: ${error.message}`);
  }
};

// List projects by userId
const listProjectsByUserId = async (userId, limit = 100, lastEvaluatedKey = null) => {
  const docClient = getDynamoDBClient();
  const tableName = process.env.PROJECTS_TABLE || 'projects-dev';
  const params = {
    TableName: tableName,
    IndexName: 'userId-index',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
    Limit: limit,
  };

  if (lastEvaluatedKey) {
    params.ExclusiveStartKey = lastEvaluatedKey;
  }

  try {
    const command = new QueryCommand(params);
    const result = await docClient.send(command);
    return {
      items: result.Items || [],
      lastEvaluatedKey: result.LastEvaluatedKey,
      count: result.Count,
    };
  } catch (error) {
    console.error('Error listing projects:', error);
    throw new Error(`Failed to list projects: ${error.message}`);
  }
};

// Update a project
const updateProject = async (id, updateData) => {
  const docClient = getDynamoDBClient();
  const tableName = process.env.PROJECTS_TABLE || 'projects-dev';

  // Build update expression
  const updateExpressions = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  Object.keys(updateData).forEach((key, index) => {
    if (key !== 'id' && key !== 'userId') {
      const attrName = `#attr${index}`;
      const attrValue = `:val${index}`;
      updateExpressions.push(`${attrName} = ${attrValue}`);
      expressionAttributeNames[attrName] = key;
      expressionAttributeValues[attrValue] = updateData[key];
    }
  });

  // Always update the updatedAt timestamp
  const updatedAtAttr = `#attr${updateExpressions.length}`;
  const updatedAtVal = `:val${updateExpressions.length}`;
  updateExpressions.push(`${updatedAtAttr} = ${updatedAtVal}`);
  expressionAttributeNames[updatedAtAttr] = 'updatedAt';
  expressionAttributeValues[updatedAtVal] = new Date().toISOString();

  const command = new UpdateCommand({
    TableName: tableName,
    Key: {
      id: id,
    },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  });

  try {
    const result = await docClient.send(command);
    return result.Attributes;
  } catch (error) {
    if (error.name === 'ResourceNotFoundException' || error.name === 'ValidationException') {
      return null;
    }
    console.error('Error updating project:', error);
    throw new Error(`Failed to update project: ${error.message}`);
  }
};

// Delete a project
const deleteProject = async (id) => {
  const docClient = getDynamoDBClient();
  const tableName = process.env.PROJECTS_TABLE || 'projects-dev';
  const command = new DeleteCommand({
    TableName: tableName,
    Key: {
      id: id,
    },
    ReturnValues: 'ALL_OLD',
  });

  try {
    const result = await docClient.send(command);
    return result.Attributes || null;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw new Error(`Failed to delete project: ${error.message}`);
  }
};

// ========== ENHANCED TASKS FUNCTIONS ==========

// List tasks by projectId
const listTasksByProjectId = async (projectId, limit = 100, lastEvaluatedKey = null) => {
  const docClient = getDynamoDBClient();
  const tableName = process.env.TASKS_TABLE || 'tasks-dev';
  const params = {
    TableName: tableName,
    IndexName: 'projectId-index',
    KeyConditionExpression: 'projectId = :projectId',
    ExpressionAttributeValues: {
      ':projectId': projectId,
    },
    Limit: limit,
  };

  if (lastEvaluatedKey) {
    params.ExclusiveStartKey = lastEvaluatedKey;
  }

  try {
    const command = new QueryCommand(params);
    const result = await docClient.send(command);
    return {
      items: result.Items || [],
      lastEvaluatedKey: result.LastEvaluatedKey,
      count: result.Count,
    };
  } catch (error) {
    console.error('Error listing tasks by project:', error);
    throw new Error(`Failed to list tasks: ${error.message}`);
  }
};

module.exports = {
  getDynamoDBClient,
  // Tasks
  createTask,
  getTaskById,
  listTasks,
  listTasksByProjectId,
  updateTask,
  deleteTask,
  // Projects
  createProject,
  getProjectById,
  listProjectsByUserId,
  updateProject,
  deleteProject,
};

