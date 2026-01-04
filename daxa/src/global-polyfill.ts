/**
 * Polyfill para definir 'global' no ambiente do navegador
 * Necessário para bibliotecas como sockjs-client que esperam o objeto 'global' do Node.js
 */
(function (global: any) {
    if (typeof global === 'undefined') {
        // Define 'global' como 'window' no navegador ou 'globalThis' se disponível
        (window as any).global = globalThis || window;
    }
})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {});

