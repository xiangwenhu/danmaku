import getManager, { DanmuManager } from "./lib/index";

const videoEl = document.querySelector("video");
let isPlayed = false;
videoEl.oncanplay = function() {
    if (!isPlayed) {
        isPlayed = true;
    }
};
const containerEl = document.getElementById("container");
var manager: DanmuManager | null = null;
manager = getManager(containerEl);
(window as any).manager = manager;
manager.init({
    duration: 8000,
    slideRatio: 3,
    useMeasure: true
});
manager.start();
let ticket = 0;

const pools = [
    { content: "完结撒花完结撒花完结撒花", style: "color:Red" },
    { content: "25.5啥的也算一级", style: "color:green", type: "acc" },
    {
        forceDetect: true,
        type: "acc",
        content:
            "<img src='//static.hdslb.com/images/member/noface.gif' style='height:20px;vertical-align: middle;'>留下jo印留下jo印留下jo印"
    },
    { ype: "acc", render: "高价回收天堂之眼，不要问我为什么" },
    {
        render: ({ left, top }) => {
            const el = document.createElement("span");
            el.innerHTML = "麦姐在学院除了老大老二基本就是最厉害的了 from span";
            el.style.left = left + "px";
            el.style.top = top + "px";
            // el.style.zIndex = "999";
            // el.style.backgroundColor = "#666";
            return el;
        }
    },
    // {
    //     content:
    //         "<img src='https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1565416527128&di=86e45c16db43679153f959bbe08a3f51&imgtype=0&src=http%3A%2F%2Fimg.xinxic.com%2Fimg%2F35167cff7ee71983.jpg' style='height:60px'/>",
    //     forceDetect: true,
    //     style: "z-index:99;"
    // },
    "好假炮姐当年1v3有一个5的和两个4的都打得过",
    "这个女的好帅啊，一拳一个机器人的那个",
    "哇喔哇喔哇喔哇喔好燃啊！！！",
    "黑琴黑琴黑琴黑琴黑琴黑琴黑琴黑琴黑琴黑琴黑琴黑琴黑琴黑琴",
    {
        content: "子弹是金属，枪也是金属，炮姐直接操控啊",
        style: "border:solid 1px blue",
        type: "acc"
    }
];

function getRandomIndex(len: number) {
    return ~~(Math.random() * len);
}

function batchGet(count: number) {
    const r = [];
    const len = pools.length;
    for (let i = 0; i < count; i++) {
        r.push(pools[getRandomIndex(len)]);
    }
    return r;
}

const txtIntervalEl = document.getElementById("txtInterval") as HTMLInputElement;
const txtBatchCount = document.getElementById("txtBatchCount") as HTMLInputElement;
function startBatch() {
    const batchCount = +txtBatchCount.value;
    manager.sendDanmu(batchGet(batchCount));
    ticket = setInterval(function() {
        manager.sendDanmu(batchGet(batchCount));
    }, +txtIntervalEl.value);
}

let isBigTest = false;
const txtDanmuEl: HTMLInputElement = document.getElementById("txtDanmu") as HTMLInputElement;
document.getElementById("btnSend").addEventListener(
    "click",
    ev => {
        manager.sendDanmu(txtDanmuEl.value);
        ev.stopPropagation();
    },
    false
);

document.getElementById("btnPause").addEventListener("click", () => {
    if (isBigTest) {
        clearInterval(ticket);
    }
    manager.pause();
});

document.getElementById("btnContiue").addEventListener("click", () => {
    if (isBigTest) {
        startBatch();
    }
    manager.continue();
});

document.getElementById("btnStart").addEventListener("click", () => {
    manager.start();
});

document.getElementById("btnStop").addEventListener("click", () => {
    manager.stop();
    clearInterval(ticket);
    isBigTest = false;
});

document.getElementById("btnBigTest").addEventListener("click", () => {
    if (isBigTest) {
        return;
    }
    clearInterval(ticket);
    manager.start();
    startBatch();
    isBigTest = true;
});
(function() {
    var script = document.createElement("script");
    script.onload = function() {
        var stats = new window.Stats();
        document.body.appendChild(stats.dom);
        requestAnimationFrame(function loop() {
            stats.update();
            requestAnimationFrame(loop);
        });
    };
    script.src = "//mrdoob.github.io/stats.js/build/stats.min.js";
    document.head.appendChild(script);
})();

const lbTotal = document.getElementById("lbTotal");
const lbHide = document.getElementById("lbHide");
const lbInView = document.getElementById("lbInView");

const rect = containerEl.getBoundingClientRect();
const { left, width } = rect;
const right = left + width;
setInterval(function() {
    (window as any).requestIdleCallback(() => {
        const allItems = Array.from(document.querySelectorAll(".danmu-item"));

        const commonItems = Array.from(
            document.querySelectorAll(".danmu-item:not(.danmu-item-acc)")
        );
        const accCount = document.querySelectorAll(".danmu-item-acc").length;
        const len = allItems.length;
        const inHideLen = allItems.filter(item => item.classList.contains("hide")).length;
        const inViewLen = commonItems.filter(function(item) {
            const rect = item.getBoundingClientRect();
            const b = !item.classList.contains("hide") && rect.left + rect.width >= left;
            return b;
        }).length;

        lbTotal.innerText = len + "-" + accCount;
        lbHide.innerHTML = inHideLen + "";
        lbInView.innerHTML = inViewLen + "";
    });
}, 5000);

document.addEventListener("visibilitychange", function() {
    // 用户离开了当前页面
    if (document.visibilityState === "hidden") {
        manager.stop();
        console.log("stop....");
        // console.log(document.getElementById("frames_frame1").getBoundingClientRect())
    }

    // 用户打开或回到页面
    if (document.visibilityState === "visible") {
        manager.start();
        console.log("start....");
        // console.log(document.getElementById("frames_frame1").getBoundingClientRect())
    }
});

document.addEventListener("fullscreenchange", function() {
    console.log("fullscreenchange");
    if (!document.fullscreenElement) {
        quitFull();
        return;
    }
    goFull();
});

document.getElementById("btnFull").addEventListener("click", ev => {
    ev.stopPropagation();
    document.body.requestFullscreen().then(() => {
        setTimeout(() => {
            goFull();
        }, 0);
    });
});

function goFull() {
    containerEl.classList.add("fullScreen");
    videoEl.classList.add("fullScreen");
    videoEl.setAttribute("webkit-playsinline", "");
    videoEl.setAttribute("playsinline", "");

    manager.resize({
        duration: 10000
    });
}

function quitFull() {
    containerEl.style.width = "1349px";
    containerEl.style.height = "758px";
    containerEl.classList.remove("fullScreen");
    videoEl.classList.remove("fullScreen");
    manager.resize({
        duration: 8000
    });
}
