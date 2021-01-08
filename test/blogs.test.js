const Page = require('./helpers/page')

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000')
});

afterEach(async () => {
    await page.close();
})

describe("when logged in", async () => {
    beforeEach(async () => {
        await page.login();
        await page.click('a.btn-floating');
    });

    test("can see blog create form", async () => {
        const label = await page.getContentsOf('form label');
        expect(label).toEqual("Blog Title");
    })

    describe("And using valid inputs", async () => {

        beforeEach(async() => {
            await page.type("input[name='title']", "My Title"); 
            await page.type("input[name='content']", "My Content");
            await page.click("form button");
        })

        test("Submitting takes user to review screen", async () => {
            const text = await page.getContentsOf("h5");
            expect(text).toEqual("Please confirm your entries");
        });

        test("Submitting then saving adds blog", async () => {
           await page.click("button.green");
           await page.waitFor(".card");

           const title = await page.getContentsOf(".card-title");
           const content = await page.getContentsOf("p");
           expect(title).toEqual("My Title");
           expect(content).toEqual("My Content");
        });

    });

});


describe("when not logged in", async () => {
    
    const actions = [
        {
            method: 'get',
            path: '/api/blogs'
        },
        {
            method: 'post',
            path: '/api/blogs',
            data: { title: 'Test Title', content: 'Test Content'}
        }
    ]

    test('Blog related actions are prohibited', async () => {
        const results = await page.execRequests(actions);
        for (let result of results) {
            expect(result).toEqual({ error: "You must log in!"});
        }
    });


});