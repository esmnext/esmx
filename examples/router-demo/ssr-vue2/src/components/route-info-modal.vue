<template>
    <div v-if="show" class="modal-overlay" @click="$emit('close')">
        <div class="modal-content" @click.stop>
            <div class="modal-header">
                <h3>Current Route Information</h3>
                <button class="close-btn" @click="$emit('close')">&times;</button>
            </div>
            <div class="modal-body">
                Route:
                <CollapsibleJson :data="$route" :collapseDepth="3" :collapseRoot="true" />
                <p>Router parsedOptions:</p>
                <CollapsibleJson :data="$router.parsedOptions" :collapseDepth="1" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from '@esmx/router-vue';
import CollapsibleJson from './collapsible-json.vue';

defineProps<{
    show: boolean;
}>();

defineEmits<{
    close: [];
}>();

const $route = useRoute();
const $router = useRouter();
</script>

<style scoped>
/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: var(--spacing-4);
    overscroll-behavior: contain;
}

.modal-content {
    background: var(--card-color);
    border-radius: var(--border-radius-xl);
    border: 1px solid var(--border-light);
    width: 61.8vw;
    height: 80vh;
    overflow: hidden;
    box-shadow: var(--shadow-xl);
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-4) var(--spacing-6);
    border-bottom: 1px solid var(--border-light);
    background: var(--bg-secondary);
}

.modal-header h3 {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--text-primary);
}

.close-btn {
    background: none;
    border: none;
    font-size: var(--font-size-xl);
    color: var(--text-secondary);
    cursor: pointer;
    padding: var(--spacing-2);
    border-radius: var(--border-radius);
    transition: all var(--duration-fast);
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.close-btn:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
}

.modal-body {
    padding: var(--spacing-6);
    overflow-y: auto;
    max-height: calc(80vh - 80px);
}

@media (max-width: 768px) {
    .modal-overlay {
        padding: var(--spacing-2);
    }
    
    .modal-content {
        max-height: 90vh;
    }
    
    .modal-body {
        padding: var(--spacing-4);
        max-height: calc(90vh - 80px);
    }
}
</style>
