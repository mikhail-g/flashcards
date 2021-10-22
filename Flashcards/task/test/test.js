const puppeteer = require('puppeteer');
const path = require('path');
// '..' since we're in the test/ subdirectory; learner is supposed to have src/index.html
const pagePath = 'file://' + path.resolve(__dirname, '../src/index.html');

const hs = require('hs-test-web');

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function stageTest() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args:['--start-maximized']
    });

    const page = await browser.newPage();
    await page.goto(pagePath);

    page.on('console', msg => console.log(msg.text()));

    await sleep(1000);

    let result = await hs.testPage(page,
        () => {
            let h1 = document.body.getElementsByTagName("h1");

            if (h1.length === 0) return hs.wrong("There should be h1 element on the page");
            if (h1.length > 1) return hs.wrong("There should be only one h1 element on the page.")
            if (! h1[0].innerText) return hs.wrong("The h1 element should contain text.")

            return hs.correct()
        },
        () => {
            let divs = document.body.getElementsByTagName("div");
            let k = 0;
            for (let div of divs) {
                if ((div.children.length === 1 && div.children[0].tagName.toLowerCase() === 'p') && div.innerText)
                    k++;
            }

            return k === 9 ? hs.correct() : hs.wrong("There should be 9 div elements with text inside 'p' element.");
        }
    )

    await browser.close();
    return result;
}

jest.setTimeout(30000);
test("Test stage", async () => {
        let result = await stageTest();
        if (result['type'] === 'wrong') {
            fail(result['message']);
        }
    }
);
