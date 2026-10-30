/**
 * LostLink — Automated Load Testing & Benchmark Tool
 * For Digital Assignment 3 (Question 1)
 *
 * Zero external dependencies (uses native Node.js http/https).
 *
 * Usage:
 *   node scripts/load_test.js [options]
 *
 * Options:
 *   --url=<url>           Target URL (default: http://localhost:8080/api/items)
 *   --requests=<n>        Total requests to send (default: 1000)
 *   --concurrency=<c>     Concurrent worker streams (default: 20)
 *   --timeout=<ms>        Per-request timeout in ms (default: 10000)
 *   --label=<name>        Label for this run (e.g. "1-instance", "3-instances")
 *   --json                Output summary as JSON
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

// Parse CLI arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [k, v] = arg.replace(/^--/, '').split('=');
  acc[k] = v === undefined ? true : v;
  return acc;
}, {});

const targetUrl = args.url || 'http://localhost:8080/api/items';
const totalRequests = parseInt(args.requests, 10) || 1000;
const concurrency = parseInt(args.concurrency, 10) || 20;
const timeoutMs = parseInt(args.timeout, 10) || 10000;
const label = args.label || `${totalRequests} reqs @ concurrency ${concurrency}`;

const parsedUrl = new URL(targetUrl);
const client = parsedUrl.protocol === 'https:' ? https : http;

console.log('='.repeat(70));
console.log(` 🚀 LostLink Automated Benchmark & Load Tester`);
console.log(` Label       : ${label}`);
console.log(` Target URL  : ${targetUrl}`);
console.log(` Total Reqs  : ${totalRequests}`);
console.log(` Concurrency : ${concurrency}`);
console.log(` Timeout     : ${timeoutMs} ms`);
console.log('='.repeat(70));

const latencies = [];
const instanceCounts = {};
const statusCounts = {};
let completed = 0;
let errors = 0;
let started = 0;

const startTime = process.hrtime.bigint();

const burstHeader = args.burst ? 'true' : (args.header || null);

function sendRequest() {
  if (started >= totalRequests) return;
  started++;

  const reqStart = process.hrtime.bigint();

  const reqHeaders = {
    'User-Agent': 'LostLink-Benchmark/1.0',
    Accept: 'application/json, text/plain, */*',
  };
  if (burstHeader) {
    reqHeaders['X-LostLink-Burst'] = burstHeader;
  }

  const req = client.get(
    targetUrl,
    {
      timeout: timeoutMs,
      headers: reqHeaders,
    },
    (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const reqEnd = process.hrtime.bigint();
        const durationMs = Number(reqEnd - reqStart) / 1e6;
        latencies.push(durationMs);

        const status = res.statusCode;
        statusCounts[status] = (statusCounts[status] || 0) + 1;

        const instance = res.headers['x-lostlink-instance'] || 'unknown';
        instanceCounts[instance] = (instanceCounts[instance] || 0) + 1;

        if (status >= 400) {
          errors++;
        }

        completed++;
        printProgress();
        next();
      });
    }
  );

  req.on('timeout', () => {
    req.destroy(new Error('ETIMEDOUT'));
  });

  req.on('error', (err) => {
    const reqEnd = process.hrtime.bigint();
    const durationMs = Number(reqEnd - reqStart) / 1e6;
    latencies.push(durationMs);

    errors++;
    statusCounts[`ERR: ${err.code || err.message}`] =
      (statusCounts[`ERR: ${err.code || err.message}`] || 0) + 1;
    completed++;
    printProgress();
    next();
  });
}

function printProgress() {
  if (completed % 100 === 0 || completed === totalRequests) {
    const pct = ((completed / totalRequests) * 100).toFixed(0);
    process.stdout.write(
      `\r Progress: ${completed}/${totalRequests} (${pct}%) | Errors: ${errors} `
    );
  }
}

function next() {
  if (completed >= totalRequests) {
    finish();
  } else if (started < totalRequests) {
    sendRequest();
  }
}

function finish() {
  const totalEnd = process.hrtime.bigint();
  const totalDurationSec = Number(totalEnd - startTime) / 1e9;
  process.stdout.write('\n\n');

  latencies.sort((a, b) => a - b);

  const sum = latencies.reduce((acc, v) => acc + v, 0);
  const avgLatency = sum / latencies.length;
  const minLatency = latencies[0] || 0;
  const maxLatency = latencies[latencies.length - 1] || 0;
  const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const rps = totalRequests / totalDurationSec;

  const resultSummary = {
    label,
    targetUrl,
    totalRequests,
    concurrency,
    totalTimeSec: parseFloat(totalDurationSec.toFixed(3)),
    rps: parseFloat(rps.toFixed(2)),
    avgLatencyMs: parseFloat(avgLatency.toFixed(2)),
    minLatencyMs: parseFloat(minLatency.toFixed(2)),
    p50LatencyMs: parseFloat(p50.toFixed(2)),
    p95LatencyMs: parseFloat(p95.toFixed(2)),
    p99LatencyMs: parseFloat(p99.toFixed(2)),
    maxLatencyMs: parseFloat(maxLatency.toFixed(2)),
    successfulRequests: totalRequests - errors,
    failedRequests: errors,
    statusCodes: statusCounts,
    instanceDistribution: instanceCounts,
  };

  if (args.json) {
    console.log(JSON.stringify(resultSummary, null, 2));
    return;
  }

  console.log('='.repeat(70));
  console.log(` 📊 BENCHMARK RESULTS — ${label}`);
  console.log('='.repeat(70));
  console.log(` Total Time Elapsed    : ${totalDurationSec.toFixed(2)} seconds`);
  console.log(` Requests per Second   : ${rps.toFixed(2)} req/sec`);
  console.log(` Average Response Time : ${avgLatency.toFixed(2)} ms`);
  console.log(` Min / Max Latency     : ${minLatency.toFixed(2)} ms / ${maxLatency.toFixed(2)} ms`);
  console.log(` Latency Percentiles   : p50 = ${p50.toFixed(2)} ms | p95 = ${p95.toFixed(2)} ms | p99 = ${p99.toFixed(2)} ms`);
  console.log(` Successful Requests   : ${totalRequests - errors}`);
  console.log(` Failed Requests       : ${errors} (${((errors / totalRequests) * 100).toFixed(2)}%)`);
  console.log('-'.repeat(70));
  console.log(' HTTP Status Codes:');
  for (const [code, count] of Object.entries(statusCounts)) {
    console.log(`   [${code}]: ${count}`);
  }
  console.log('-'.repeat(70));
  console.log(' Load Distribution across Backend Instances (X-LostLink-Instance):');
  for (const [inst, count] of Object.entries(instanceCounts)) {
    const share = ((count / totalRequests) * 100).toFixed(1);
    console.log(`   🏷️  ${inst.padEnd(20)}: ${count} requests (${share}%)`);
  }
  console.log('='.repeat(70));

  console.log('\n Markdown Table Row:');
  console.log(`| ${label} | ${totalRequests} | ${concurrency} | ${rps.toFixed(2)} | ${avgLatency.toFixed(2)} ms | ${p95.toFixed(2)} ms | ${errors} |`);
  console.log('\n');
}

// Start concurrent worker pool
const poolSize = Math.min(concurrency, totalRequests);
for (let i = 0; i < poolSize; i++) {
  sendRequest();
}
