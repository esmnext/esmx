export class IncrementId {
    private value = 0;
    public equal(id: number) {
        return this.value === id;
    }
    public generate() {
        this.value++;
        return this.value;
    }
}

export const PAGE_ID = new IncrementId();
export const LAYER_ID = new IncrementId();
