import Layer from "./layers/layer";
import CommonLayer, { CommonLayerOption } from "./layers/common";
import AccLayer from "./layers/acc";
import { enqueue, addListener, removeListener } from "./queue";

export interface DanmuItem {
    content?: string;
    forceDetect?: boolean;
    render?: ((any) => HTMLElement) | HTMLElement | string;
    className?: string;
    style?: string;
    trace?: number;
    duration?: number;
}

type DanmuContent = string | DanmuItem;

function toDanmuItem(danmu: string | DanmuItem): DanmuItem {
    return typeof danmu === "string" ? { content: danmu } : danmu;
}

export class DanmuManager {
    private layers: Layer[] = [];
    private status: 0 | 1 | 2; // 枚举？ 0: 停止  1 运行  2 暂停

    constructor() {
        this.batch = this.batch.bind(this);
    }

    private batch(data: DanmuItem[]) {
        // 改进批量
        data.forEach(d => {
            const layer =
                this.layers.find(l => d.duration === (l as CommonLayer).option.duration) ||
                this.layers[0];

            if (layer) {
                layer.send([d]);
            }
        });
    }

    sendDanmu(danmu: DanmuContent[] | DanmuItem | string) {
        if (this.status !== 1) {
            return;
        }
        let contents: DanmuItem[] = null;
        if (Array.isArray(danmu)) {
            contents = danmu.map((d: DanmuItem | string) => toDanmuItem(d));
        } else {
            contents = [toDanmuItem(danmu)];
        }

        enqueue(contents);
    }

    init(container: HTMLElement, option?: CommonLayerOption[]) {
        let optionArr = option;
        if (!Array.isArray(option)) {
            optionArr = [option];
        }

        optionArr
            .map((opt, index) => {
                if (opt.zIndex == null) {
                    opt.zIndex = index * 2;
                }
                const layer = new CommonLayer(container);
                layer.init(Object.assign({}, opt, { id: index }));
                return layer;
            })
            .forEach((layer: Layer) => this.layers.push(layer));
    }

    start() {
        if (this.status === 1) {
            return;
        }
        this.layers.forEach(l => l.start());
        addListener(this.batch);
        this.status = 1;
    }

    stop() {
        if (this.status !== 1) {
            return;
        }
        this.layers.forEach(l => l.stop());
        removeListener(this.batch);
        this.status = 0;
    }

    pause() {
        if (this.status !== 1) {
            return;
        }
        this.layers.forEach(l => l.pause());
        this.status = 2;
    }

    continue() {
        if (this.status !== 2) {
            return;
        }
        this.layers.forEach(l => l.continue());
        this.status = 1;
    }

    resize(option: CommonLayerOption) {
        this.layers.forEach(l => l.resize(option));
    }

    destory() {
        this.layers.forEach(l => l.destroy());
    }
}

function getDanmuManager(): DanmuManager {
    return new DanmuManager();
}

export default getDanmuManager;
