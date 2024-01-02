
const publicVapidKey = "BNHmEPgniTgIAe39bC04Ws74O4LeZ4EWRee8R3mUYOpZIz3sRq8g1bK_RcwzXXSC7eUetJrK7InT6RtmtoIYM4Q";

if('serviceWorker' in navigator) {
    registerServiceWorker().catch(console.log)
}

async function registerServiceWorker() {
    const register = await navigator.serviceWorker.register('./worker.js', {
        scope: '/'
    });

    const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicVapidKey,
    });

    await fetch("/subscribe", {
        method: "POST",
        body: JSON.stringify(subscription),
        headers: {
            "Content-Type": "application/json",
        }
    })
}