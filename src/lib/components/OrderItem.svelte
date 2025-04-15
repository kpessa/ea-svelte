<script lang="ts">
    import type { Order } from '../types';

    export let order: Order;
    export let sectionIndex: number;
    export let isSingleSelect: boolean;

    const orderId = `order-${sectionIndex}-${order.MNEMONIC}`;
</script>

<div class="order-item">
    <div class="order-checkbox">
        <input 
            type="checkbox" 
            id={orderId}
            disabled={isSingleSelect}
        />
        <div class="order-content">
            <div class="mnemonic">
                {order.MNEMONIC}
            </div>
            {#if order.ORDER_SENTENCE}
                <div class="order-sentence">
                    {@html order.ORDER_SENTENCE}
                </div>
            {/if}
            {#if order.COMMENT}
                <div class="comment">
                    {@html order.COMMENT}
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    .order-item {
        display: block;
        padding: 8px;
        border-bottom: 1px solid #eee;
    }

    .order-checkbox {
        display: flex;
        align-items: flex-start;
        margin-right: 0;
        width: 100%;
    }

    .order-checkbox input[type="checkbox"] {
        margin-top: 6px;
        margin-right: 12px;
        flex-shrink: 0;
    }

    .order-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .mnemonic {
        font-weight: bold;
        font-size: 14px;
        color: #333;
    }

    .order-sentence {
        font-size: 13px;
        color: #444;
        line-height: 1.4;
    }

    .asc-description {
        font-size: 13px;
        color: #555;
        margin-top: 2px;
    }

    .comment {
        font-size: 12px;
        color: #666;
        margin-top: 4px;
        border-left: 2px solid #ddd;
        padding-left: 8px;
        line-height: 1.4;
    }
</style> 