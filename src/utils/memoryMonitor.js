/**
 * Memory monitoring utility for Redux state
 * Tracks state size growth and logs metrics
 */

const calculateObjectSize = (obj) => {
  const seen = new WeakSet();
  
  const sizeOf = (obj) => {
    if (obj === null || obj === undefined) return 0;
    
    const type = typeof obj;
    if (type === 'number') return 8;
    if (type === 'string') return obj.length * 2;
    if (type === 'boolean') return 4;
    
    if (type === 'object') {
      if (seen.has(obj)) return 0;
      seen.add(obj);
      
      let bytes = 0;
      if (Array.isArray(obj)) {
        bytes = obj.reduce((acc, val) => acc + sizeOf(val), 0);
      } else {
        bytes = Object.keys(obj).reduce((acc, key) => {
          return acc + key.length * 2 + sizeOf(obj[key]);
        }, 0);
      }
      return bytes;
    }
    
    return 0;
  };
  
  return sizeOf(obj);
};

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export class MemoryMonitor {
  constructor(store, options = {}) {
    this.store = store;
    this.interval = options.interval || 10000; // 10 seconds default
    this.enabled = options.enabled !== false;
    this.timerId = null;
    this.history = [];
    this.maxHistory = options.maxHistory || 50;
  }

  start() {
    if (!this.enabled) return;
    
    console.log('🔍 Memory Monitor Started');
    this.log(); // Initial log
    
    this.timerId = setInterval(() => {
      this.log();
    }, this.interval);
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
      console.log('🔍 Memory Monitor Stopped');
    }
  }

  log() {
    const state = this.store.getState();
    const roomState = state.room || {};
    
    // Calculate sizes for ALL Redux slices
    const sliceSizes = {};
    Object.keys(state).forEach(sliceKey => {
      sliceSizes[sliceKey] = calculateObjectSize(state[sliceKey]);
    });
    
    // Sort slices by size (largest first)
    const sortedSlices = Object.entries(sliceSizes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // Top 10
    
    const metrics = {
      timestamp: new Date().toISOString(),
      // Total Redux store size
      totalStoreSize: formatBytes(calculateObjectSize(state)),
      totalStoreSizeBytes: calculateObjectSize(state),
      // Top Redux slices by size
      topSlices: sortedSlices.map(([name, size]) => ({
        name,
        size: formatBytes(size),
        sizeBytes: size,
      })),
      // Room state details
      messages: {
        count: Object.keys(roomState.messages?.byId || {}).length,
        size: formatBytes(calculateObjectSize(roomState.messages || {})),
      },
      messagesContent: {
        count: Object.keys(roomState.messagesContent || {}).length,
        size: formatBytes(calculateObjectSize(roomState.messagesContent || {})),
      },
      messageParts: {
        count: Object.keys(roomState.messageParts?.byId || {}).length,
        size: formatBytes(calculateObjectSize(roomState.messageParts || {})),
      },
      threads: {
        count: Object.keys(roomState.threads?.byId || {}).length,
        size: formatBytes(calculateObjectSize(roomState.threads || {})),
      },
      executions: {
        count: Object.keys(roomState.executions?.byId || {}).length,
        size: formatBytes(calculateObjectSize(roomState.executions || {})),
      },
      tabs: {
        count: roomState.tabs?.allIds?.length || 0,
        size: formatBytes(calculateObjectSize(roomState.tabs || {})),
      },
      totalRoomSize: formatBytes(calculateObjectSize(roomState)),
    };

    // Store in history
    this.history.push(metrics);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    // Log to console
    console.group('📊 Memory Monitor Report');
    console.log('Timestamp:', metrics.timestamp);
    console.log('');
    console.log('🎯 TOTAL REDUX STORE:', metrics.totalStoreSize);
    console.log('');
    console.log('📦 Top Redux Slices by Size:');
    metrics.topSlices.forEach((slice, index) => {
      const percentage = ((slice.sizeBytes / metrics.totalStoreSizeBytes) * 100).toFixed(1);
      console.log(`  ${index + 1}. ${slice.name}: ${slice.size} (${percentage}%)`);
    });
    console.log('');
    console.log('💬 Room State Details:');
    console.log('  Messages:', metrics.messages.count, '|', metrics.messages.size);
    console.log('  Message Content:', metrics.messagesContent.count, '|', metrics.messagesContent.size);
    console.log('  Message Parts:', metrics.messageParts.count, '|', metrics.messageParts.size);
    console.log('  Threads:', metrics.threads.count, '|', metrics.threads.size);
    console.log('  Executions:', metrics.executions.count, '|', metrics.executions.size);
    console.log('  Tabs:', metrics.tabs.count, '|', metrics.tabs.size);
    console.log('  Total Room:', metrics.totalRoomSize);
    
    // Show growth trend if we have history
    if (this.history.length > 1) {
      const previous = this.history[this.history.length - 2];
      const messageDelta = metrics.messages.count - previous.messages.count;
      const threadDelta = metrics.threads.count - previous.threads.count;
      const partsDelta = metrics.messageParts.count - previous.messageParts.count;
      
      if (messageDelta !== 0 || threadDelta !== 0 || partsDelta !== 0) {
        console.log('📈 Growth since last check:');
        if (messageDelta !== 0) console.log(`  Messages: ${messageDelta > 0 ? '+' : ''}${messageDelta}`);
        if (threadDelta !== 0) console.log(`  Threads: ${threadDelta > 0 ? '+' : ''}${threadDelta}`);
        if (partsDelta !== 0) console.log(`  Parts: ${partsDelta > 0 ? '+' : ''}${partsDelta}`);
      }
    }
    
    console.groupEnd();

    return metrics;
  }

  getHistory() {
    return this.history;
  }

  getLatest() {
    return this.history[this.history.length - 1] || null;
  }

  clear() {
    this.history = [];
  }
}

// Singleton instance
let monitorInstance = null;

export const startMemoryMonitoring = (store, options) => {
  if (monitorInstance) {
    monitorInstance.stop();
  }
  
  monitorInstance = new MemoryMonitor(store, options);
  monitorInstance.start();
  
  // Expose to window for debugging
  if (typeof window !== 'undefined') {
    window.__memoryMonitor = monitorInstance;
  }
  
  return monitorInstance;
};

export const stopMemoryMonitoring = () => {
  if (monitorInstance) {
    monitorInstance.stop();
    monitorInstance = null;
  }
};

export default MemoryMonitor;

