self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // ────── SEARCH FOR DASHBOARD WINDOW ──────
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url.includes('/admin/dashboard')) {
          return client.focus();
        }
      }
      
      // If no dashboard window found, open a new one
      return clients.openWindow('/admin/dashboard');
    })
  );
});
