import { version } from './vue/index';
import { version as vue2Version } from './vue2/index';

const versions = [
    { name: 'vue3', clientVersion: version },
    { name: 'vue2', clientVersion: vue2Version }
];

function checkVersionConsistency() {
    versions.forEach(({ name, clientVersion }) => {
        const serverVersion = document.getElementById(
            `${name}-server-version`
        )?.textContent;
        const status = document.getElementById(`${name}-status`);
        const card = document.getElementById(`${name}-card`);

        const clientVersionEl = document.getElementById(
            `${name}-client-version`
        );
        if (clientVersionEl) clientVersionEl.textContent = clientVersion;

        if (!status || !card) return;

        const isConsistent = clientVersion === serverVersion;
        status.className = `status-indicator status-${
            isConsistent ? 'consistent' : 'inconsistent'
        }`;
        const icon = status.querySelector('.icon');
        const text = status.querySelector('span:not(.icon)');
        if (icon) {
            icon.className = `icon ${isConsistent ? 'success' : 'error'}`;
            icon.textContent = isConsistent ? '✓' : '✗';
        }
        if (text) {
            text.textContent = `Module versions ${
                isConsistent ? 'consistent' : 'inconsistent'
            }`;
        }

        if (isConsistent) {
            card.classList.add('consistency-animation');
            setTimeout(
                () => card.classList.remove('consistency-animation'),
                2000
            );
        }
    });
}

checkVersionConsistency();
