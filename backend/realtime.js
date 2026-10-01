const clients = new Set();

function broadcast(payload) {
  const data = JSON.stringify(payload);
  for (const res of clients) {
    res.write(`data: ${data}\n\n`);
  }
}

function attachEventsRoute(app) {
  app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    clients.add(res);
    req.on('close', () => clients.delete(res));
  });
}

module.exports = { broadcast, attachEventsRoute };
