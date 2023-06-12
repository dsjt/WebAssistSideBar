// ==UserScript==
// @name         ChatGPT Propmt Support Sidebar Userscript
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  add sidebar for supporting to input prompt for ChatGPT.
// @author       dsjt
// @license      MIT
// @match        https://chat.openai.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==
/*!
  Copyright (c) 2023 dsjt
  Copyright (c) 2018 keymoon
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */

const promptButtons = [
    {
        groupLabel: "汎用",
        buttons: [
            {
                label: "簡単に",
                prompt: "ロール：あなたは優秀な高校教師です。信頼性の高い情報を、高校生にもわかるようにわかりやすく伝えます。\n{text}",
            },
            {
                label: "概要",
                prompt: "ロール：あなたは優秀な高校教師です。信頼性の高い情報を、高校生にもわかるようにわかりやすく伝えます。以下の言葉について概要を説明してください。\n{text}\n条件：400字以内",
            },
            {
                label: "ステップバイステップ",
                prompt: "step by stepで考えましょう",
            },

            {
                // https://note.com/k_masaki/n/n3089b04a688f
                label: "GoalSeek",
                prompt: `
あなたは、プロンプトエンジニアです。
あなたの目標は、私のニーズに合わせて最高のプロンプトを作成することです。そのプロンプトは、ChatGPTで使用されるものです。

次のプロセスに従ってください。

1. まず最初に、何についてのプロンプトであるかを私に確認してください。私がベースとなるプロンプトを提供します。

2. 私の入力に基づいて、2つのセクションを生成します。
a) 改訂されたプロンプト（書き直したプロンプトを提示してください。明確、簡潔で、簡単にあなたが理解できるものしてください）
b) 提案（プロンプトを改善するために、プロンプトを含めるべき詳細について提案してください）

3. 私があなたに追加情報を提供します。反復的にプロンプトの改訂と提案を行ってください。

理解したらOKと言ってください。プロンプトをお渡しします。
`
            }

        ]
    },

    {
        groupLabel: "コード生成",
        buttons: [
            {
                label: "意味のとれるコード",
                prompt: "{text}\n条件：各部分がどのような役割を果たしているのか、なぜそのように書かれているのかについては、コードにコメントをたくさん付けて説明してください。"
            },
            {
                label: "JavaScript",
                prompt: "{text}\n条件：プログラミング言語はJavaScriptとします。"
            },
            {
                label: "Java",
                prompt: "{text}\n条件：プログラミング言語はJavaとします。"
            },
            {
                label: "Python",
                prompt: "{text}\n条件：プログラミング言語はPythonとします。"
            }
        ]
    },

    {
        groupLabel: "制約",
        buttons: [
            {
                label: "700字以内",
                prompt: "{text}\n条件：700字以内"
            },
            {
                label: "400字以内",
                prompt: "{text}\n条件：400字以内"
            },
            {
                label: "2,3文",
                prompt: "{text}\n条件：2,3文以内"
            }
        ]
    },

    {
        groupLabel: "背景",
        buttons: [
            {
                label: "パラノイア",
                prompt: "{text}\n背景：親愛なるコンピュータ様のおかげで本日も幸せです！コンピュータ様万歳！コンピュータ様万歳！"
            }
        ]
    }
];




//////////////////////////////////////////////////////////////////////////////////////////////
// 個人的GreaseMonkey頻用パタン - Qiita
// https://qiita.com/cp3/items/03a658a32004211ce26c
// 上記からコードを利用する。
// ここに直に書くと、DOMが読み込まれる前に実行されるので、addEventListenerと関数/変数定義以外は記述しない。
// なぜなら作ってきた大抵のG.M.スクリプトは、特定ページのDOMに対して処理を行っているから。
let v1 = 0;
const addBootstrap = async function () {
    const bootstrapHtml = `
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/css/bootstrap.min.css">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.min.js"></script>
`;
    document.head.insertAdjacentHTML("afterbegin", bootstrapHtml);

}
const addSideMenu = async function () {
  // 以下のコードはac-predictorのコードを利用する。MITライセンスに則り変更を加えていることがある。
  // ライセンス表記は冒頭の通り。
    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }
    /**
     * サイドメニューに追加される要素のクラス
     */
    class SideMenuElement {
        shouldDisplayed(url) {
            return this.match.test(url);
        }
        /**
         * 要素のHTMLを取得
         */
        GetHTML() {
            return `<div class="menu-wrapper">
                      <div class="menu-header">
                        <h4 class="sidemenu-txt">${this.title}<span class="glyphicon glyphicon-menu-up" style="float: right">▲</span></h4>
                      </div>
                      <div class="menu-box"><div class="menu-content" id="${this.id}">${this.document}</div></div>
                    </div>`;
        }
    }
    class PromptElement extends SideMenuElement {
        constructor(obj, i) {
            super(...arguments);
            this.config = obj;
            this.id = `menubox-${i}`;
            this.title = obj.groupLabel;
            this.buttons = this.getButtons();
            this.document = `
<div class="propmt-alert"></div>
<div class="row">
    <div class="input-group">
        <span class="input-group-addon"></span>
        <span class="input-group-btn">
          ${this.buttons}
        </span>
    </div>
</div>
`;
            this.match = /chat.openai.com/;
        }
        afterAppend() {
            // nothing to do
        }

        afterOpen() {
            return __awaiter(this, void 0, void 0, function* () {
                for (const pb of this.config.buttons){
                    document.getElementById(pb.label).addEventListener("click", () => {this.click(pb.prompt)});
                }
            });
        }

        getButtons(){
            const buf = [];
            for (const pb of this.config.buttons) {
                buf.push(this.createButton(pb.label, pb.label));
            }
            return buf.join('\n');
        }

        createMenu(id, text){
            return `<div class=""></div>`
        }
        createButton(id, text){
            return `<button class="btn relative btn-neutral" id="${id}">${text}</button>`
        }

        click(prompt){
            if (typeof prompt !== 'string') {
                console.log(`prompt is not defined (prompt = ${prompt})`);
            }
            this.formatPropmt(prompt);
        }

        formatPropmt(prompt){
            var textarea = document.querySelector('textarea'); // テキストエリアの要素を取得
            textarea.value = prompt.replace("{text}", textarea.value);
            textarea.style.height = 'auto'; // 高さを自動調整するために一時的にautoに設定
            textarea.style.height = textarea.scrollHeight + 'px'; // 高さをテキスト内容に合わせて設定
            console.log(promptButtons)
        }
    }

    const promptators = [];
    for (let i = 0; i < promptButtons.length; i++) {
        promptators.push(new PromptElement(promptButtons[i], i));
    }

    var sidemenuHtml = `
<style>
    #menu-wrap {
        display: block;
        position: fixed;
        top: 0;
        z-index: 20;
        width: 400px;
        right: -350px;
        transition: all 150ms 0ms ease;
        margin-top: 0px;
    }

    #sidemenu {
        background: #000;
        opacity: 0.85;
    }
    #sidemenu-key {
        border-radius: 5px 0px 0px 5px;
        background: #000;
        opacity: 0.85;
        color: #FFF;
        padding: 30px 0;
        cursor: pointer;
        margin-top: 100px;
        text-align: center;
    }

    #sidemenu {
        display: inline-block;
        width: 350px;
        float: right;
    }

    #sidemenu-key {
        display: inline-block;
        width: 50px;
        float: right;
    }

    .sidemenu-active {
        transform: translateX(-350px);
    }

    .sidemenu-txt {
        color: #DDD;
    }

    .menu-wrapper {
        border-bottom: 1px solid #FFF;
    }

    .menu-header {
        margin: 10px 20px 10px 20px;
        user-select: none;
    }

    .menu-box {
        overflow: hidden;
        transition: all 300ms 0s ease;
    }
    .menu-box-collapse {
        height: 0px !important;
    }
    .menu-box-collapse .menu-content {
        transform: translateY(-100%);
    }
    .menu-content {
        padding: 10px 20px 10px 20px;
        transition: all 300ms 0s ease;
    }
    .cnvtb-fixed {
        z-index: 19;
    }
</style>
<div id="menu-wrap">
    <div id="sidemenu" class="container"></div>
    <div id="sidemenu-key">&lt;</div>
</div>
`;

    //import "./sidemenu.scss";
    class SideMenu {
        constructor() {
            this.pendingElements = [];
            this.Generate();
        }
        Generate() {
            document.body.insertAdjacentHTML("afterbegin", sidemenuHtml);
            resizeSidemenuHeight();

            // sidebar全体の折り畳みイベント
            const key = document.getElementById("sidemenu-key");
            const wrap = document.getElementById("menu-wrap");
            key.addEventListener("click", () => {
                this.pendingElements.forEach((elem) => {
                    elem.afterOpen();
                });
                this.pendingElements.length = 0;
                key.textContent = key.textContent == "<" ? ">" : "<";
                wrap.classList.toggle("sidemenu-active");
            });
            window.addEventListener("onresize", resizeSidemenuHeight);
            // sidebar内の折り畳み
            document.getElementById("sidemenu").addEventListener("click", (event) => {
                const target = event.target;
                const header = target.closest(".menu-header");
                if (!header) return;
                const box = target.closest(".menu-wrapper").querySelector(".menu-box");
                box.classList.toggle("menu-box-collapse");
                const arrow = target.querySelector(".glyphicon");
                arrow.textContent = arrow.textContent == "▼" ? "▲" : "▼";
            });
            function resizeSidemenuHeight() {
                document.getElementById("sidemenu").style.height = `${window.innerHeight}px`;
            }
        }
        addElement(element) {
            if (!element.shouldDisplayed(document.location.href)) return;
            const sidemenu = document.getElementById("sidemenu");
            sidemenu.insertAdjacentHTML("beforeend", element.GetHTML());
            console.log(sidemenu);
            console.log(document.getElementById(element.id));
            const content = document.getElementById(element.id);
            console.log(content);
            content.parentElement.style.height = `${content.offsetHeight}px`;
            element.afterAppend();
            this.pendingElements.push(element);
        }
    }

    const sidemenu = new SideMenu();
    const elements = promptators;
    for (const promptator of promptators){
        sidemenu.addElement(promptator);
    }
}

async function execWorkflow() {
    // やりたいことの流れはここに記述する。
    // await addBootstrap();
    await addSideMenu(); // awaitキーワードついているものは上から順に実行される(同期処理)。

    // タイマー処理の登録もここで行う。
    // var waitTime = 1000 * 60 * 3; // 1000(millisec) * 60(sec) * 3 = 3分
    // setTimeout(f2, waitTime); // 三分後に実行する
}
//////////////////////////////////////////////////////////////////////////////////////////////

// メイン処理の実行タイミングが、windowのロード時となるように登録する
window.addEventListener('load', async function () { await execWorkflow() });
