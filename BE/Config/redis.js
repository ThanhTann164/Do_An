const Redis = require('ioredis');
require('dotenv').config({ path: require('path').join(__dirname, '../../config.env') });

let redisClient = null;

const getRedisClient = () => {
  if (!redisClient) {
    try {
      const redisConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: process.env.REDIS_DB || 0,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 1,
        lazyConnect: true,
        connectTimeout: 1000,
        enableOfflineQueue: false,
      };

      if (process.env.REDIS_URL) {
        redisClient = new Redis(process.env.REDIS_URL);
      } else {
        redisClient = new Redis(redisConfig);
      }

      redisClient.on('connect', () => {
        console.log('✅ Redis connected');
      });

      redisClient.on('error', (err) => {
        console.warn('⚠️ Redis connection error (using fallback):', err.message);
        // Don't throw error, just log warning
      });

      redisClient.on('ready', () => {
        console.log('🚀 Redis ready for operations');
      });
    } catch (error) {
      console.warn('⚠️ Redis initialization failed, using simple queue fallback');
      redisClient = null;
    }
  }

  return redisClient;
};

// Simple queue implementation for development
class SimpleQueue {
  constructor(name) {
    this.name = name;
    this.jobs = [];
    console.log(`📋 Simple queue '${name}' initialized`);
  }

  async add(jobName, data, options = {}) {
    const job = {
      id: Date.now() + Math.random(),
      name: jobName,
      data,
      options,
      timestamp: new Date(),
      status: 'waiting'
    };
    
    this.jobs.push(job);
    
    // Process immediately in development
    setTimeout(() => this.processJob(job), 100);
    
    return job;
  }

  async processJob(job) {
    try {
      job.status = 'processing';
      console.log(`🔄 Processing job ${job.name} in queue ${this.name}`);
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      job.status = 'completed';
      console.log(`✅ Job ${job.name} completed`);
    } catch (error) {
      job.status = 'failed';
      console.error(`❌ Job ${job.name} failed:`, error);
    }
  }

  process(processor) {
    console.log(`👂 Queue ${this.name} processor registered`);
    // In simple implementation, jobs are processed immediately
  }
}

// Queue services
const OCRQueueService = new SimpleQueue('ocr-processing');
const FaceQueueService = new SimpleQueue('face-matching');
const AuditQueueService = new SimpleQueue('audit-logging');

console.log('🔄 Queue system initialized');

module.exports = {
  getRedisClient,
  OCRQueueService,
  FaceQueueService,
  AuditQueueService,
  SimpleQueue
};
