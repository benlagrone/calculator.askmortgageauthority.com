(function () {
    const iframe = document.createElement('iframe');
    // Use configurable chat URL from meta tag, fallback to localhost for local dev
    const meta = document.querySelector('meta[name="chat-iframe-url"]');
    const chatUrl = meta && meta.content ? meta.content : 'http://localhost:9000/static/chat.html';
    iframe.src = chatUrl;
    iframe.id = 'mortgage-chatbot-iframe';
    iframe.className = 'chat-closed';

    // Append to wrapper, not body
    const wrapper = document.getElementById('chatbot-wrapper');
    wrapper.appendChild(iframe);

    function postToChat(message) {
        if (!iframe.contentWindow) return;
        iframe.contentWindow.postMessage(message, '*');
    }

    function getCurrentContext() {
        return window.IntakeContext?.getCurrentContext?.() || null;
    }

    // Listen for chat toggle command from the iframe
    window.addEventListener('message', function (event) {
        if (!event.data || typeof event.data !== 'object') return;
        const { type } = event.data;
        if (type === 'toggleChat') {
            wrapper.classList.toggle('chat-closed');
            wrapper.classList.toggle('chat-open');
            iframe.classList.toggle('chat-closed');
            iframe.classList.toggle('chat-open');
            const main = document.getElementById('main');
            if (wrapper.classList.contains('chat-open')) {
                main.classList.add('chat-open');
                main.classList.remove('chat-closed');
            } else {
                main.classList.remove('chat-open');
                main.classList.add('chat-closed');
            }
        }
    });

    document.addEventListener('ama:intake-context-updated', function (event) {
        const context = event.detail?.context;
        if (!context) return;

        postToChat({
            type: 'ama:update-context',
            context: context
        });
    });

    // Send parent URL to iframe after it loads
    iframe.onload = function () {
        const context = getCurrentContext();

        postToChat({
            parentUrl: window.location.href,
            calculatorContext: context
        });

        if (context) {
            postToChat({
                type: 'ama:set-context',
                context: context
            });
        }
    };
})();
