import { test, expect } from "playwright-test-coverage";

test("home page", async ({ page }) => {
  await page.goto("/");

  expect(await page.title()).toBe("JWT Pizza");
});

test("purchase with login", async ({ page }) => {
  await page.route("*/**/api/order/menu", async (route) => {
    const menuRes = [
      {
        id: 1,
        title: "Veggie",
        image: "pizza1.png",
        price: 0.0038,
        description: "A garden of delight",
      },
      {
        id: 2,
        title: "Pepperoni",
        image: "pizza2.png",
        price: 0.0042,
        description: "Spicy treat",
      },
    ];
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: menuRes });
  });

  await page.route("*/**/api/franchise", async (route) => {
    const franchiseRes = [
      {
        id: 2,
        name: "LotaPizza",
        stores: [
          { id: 4, name: "Lehi" },
          { id: 5, name: "Springville" },
          { id: 6, name: "American Fork" },
        ],
      },
      { id: 3, name: "PizzaCorp", stores: [{ id: 7, name: "Spanish Fork" }] },
      { id: 4, name: "topSpot", stores: [] },
    ];
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: franchiseRes });
  });

  await page.route("*/**/api/auth", async (route) => {
    const loginReq = { email: "d@jwt.com", password: "a" };
    const loginRes = {
      user: {
        id: 3,
        name: "Kai Chen",
        email: "d@jwt.com",
        roles: [{ role: "diner" }],
      },
      token: "abcdef",
    };
    expect(route.request().method()).toBe("PUT");
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  await page.route("*/**/api/order", async (route) => {
    const orderReq = {
      items: [
        { menuId: 1, description: "Veggie", price: 0.0038 },
        { menuId: 2, description: "Pepperoni", price: 0.0042 },
      ],
      storeId: "4",
      franchiseId: 2,
    };
    const orderRes = {
      order: {
        items: [
          { menuId: 1, description: "Veggie", price: 0.0038 },
          { menuId: 2, description: "Pepperoni", price: 0.0042 },
        ],
        storeId: "4",
        franchiseId: 2,
        id: 23,
      },
      jwt: "eyJpYXQ",
    };
    expect(route.request().method()).toBe("POST");
    expect(route.request().postDataJSON()).toMatchObject(orderReq);
    await route.fulfill({ json: orderRes });
  });

  await page.goto("/");

  // Go to order page
  await page.getByRole("button", { name: "Order now" }).click();

  // Create order
  await expect(page.locator("h2")).toContainText("Awesome is a click away");
  await page.getByRole("combobox").selectOption("4");
  await page.getByRole("link", { name: "Image Description Veggie A" }).click();
  await page.getByRole("link", { name: "Image Description Pepperoni" }).click();
  await expect(page.locator("form")).toContainText("Selected pizzas: 2");
  await page.getByRole("button", { name: "Checkout" }).click();

  // Login
  await page.getByPlaceholder("Email address").click();
  await page.getByPlaceholder("Email address").fill("d@jwt.com");
  await page.getByPlaceholder("Email address").press("Tab");
  await page.getByPlaceholder("Password").fill("a");
  await page.getByRole("button", { name: "Login" }).click();

  // Pay
  await expect(page.getByRole("main")).toContainText(
    "Send me those 2 pizzas right now!"
  );
  await expect(page.locator("tbody")).toContainText("Veggie");
  await expect(page.locator("tbody")).toContainText("Pepperoni");
  await expect(page.locator("tfoot")).toContainText("0.008 ₿");
  await page.getByRole("button", { name: "Pay now" }).click();

  // Check balance
  await expect(page.getByText("0.008")).toBeVisible();
});

test("register a user and login", async ({ page }) => {
  const randomString = Math.random().toString(36).substring(2, 15);
  const email = `JohnDoe${randomString}@test.com`;
  const registerName = "John Doe";
  const registerEmail = email;

  await page.route("*/**/api/auth", async (route) => {
    const registerReq = {
      name: registerName,
      email: registerEmail,
      password: "diner",
    };
    const registerRes = {
      user: {
        id: 2,
        name: registerName,
        email: registerEmail,
        roles: [{ role: "diner" }],
      },
      token: "tttttt",
    };
    expect(route.request().method()).toBe("POST");
    expect(route.request().postDataJSON()).toMatchObject(registerReq);
    await route.fulfill({ json: registerRes });
  });

  await page.goto("http://localhost:5173/");
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByPlaceholder("Full name").click();
  await page.getByPlaceholder("Full name").fill("John Doe");
  await page.getByPlaceholder("Email address").click();
  await page.getByPlaceholder("Email address").fill(email);
  await page.getByPlaceholder("Password").click();
  await page.getByPlaceholder("Password").fill("diner");
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page.getByRole("heading")).toContainText("The web's best pizza");
  await expect(page.getByLabel("Global")).toContainText("JD");
});

test("login and logout", async ({ page }) => {
  await page.route("**/api/auth", async (route) => {
    if (route.request().method() === "PUT") {
      const loginReq = { email: "d@jwt.com", password: "a" };
      const loginRes = {
        user: {
          id: 3,
          name: "Kai Chen",
          email: "d@jwt.com",
          roles: [{ role: "diner" }],
        },
        token: "abcdef",
      };
      expect(route.request().postDataJSON()).toMatchObject(loginReq);
      await route.fulfill({ json: loginRes });
    } else if (route.request().method() === "DELETE") {
      const logoutRes = {
        message: "logout successful",
      };
      await route.fulfill({ json: logoutRes });
    }
  });

  await page.goto("http://localhost:5173/");
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByPlaceholder("Email address").click();
  await page.getByPlaceholder("Email address").fill("d@jwt.com");
  await page.getByPlaceholder("Email address").press("Tab");
  await page.getByPlaceholder("Password").fill("a");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByLabel("Global")).toContainText("KC");
  await page.getByRole("link", { name: "Logout" }).click();
  await expect(page.getByRole("heading")).toContainText("The web's best pizza");
});

test("page not found", async ({ page }) => {
  await page.goto("http://localhost:5173/thispagedoesnotexist");
  await expect(page.getByRole("main")).toContainText(
    "It looks like we have dropped a pizza on the floor. Please try another page."
  );
  await expect(page.getByRole("heading")).toContainText("Oops");
  await page.getByRole("link", { name: "home" }).click();
  await expect(page.getByRole("heading")).toContainText("The web's best pizza");
});

test("franchise, about, and history pages", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await page
    .getByRole("contentinfo")
    .getByRole("link", { name: "Franchise" })
    .click();
  await expect(page.getByRole("main")).toContainText(
    "So you want a piece of the pie?"
  );
  await page.getByRole("link", { name: "About" }).click();
  await expect(page.getByRole("main")).toContainText("The secret sauce");
  await page.getByRole("link", { name: "History" }).click();
  await expect(page.getByRole("heading")).toContainText("Mama Rucci, my my");
  await page.getByRole("link", { name: "home" }).click();
  await expect(page.getByRole("heading")).toContainText("The web's best pizza");
});

test("diner dashboard", async ({ page }) => {
  await page.route("*/**/api/auth", async (route) => {
    const loginReq = { email: "JohnDoe@test.com", password: "Password123" };
    const loginRes = {
      user: {
        id: 3,
        name: "John Doe",
        email: "JohnDoe@test.com",
        roles: [{ role: "diner" }],
      },
      token: "abcdef",
    };
    expect(route.request().method()).toBe("PUT");
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  await page.goto("http://localhost:5173/");
  await expect(page.getByRole("heading")).toContainText("The web's best pizza");
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByPlaceholder("Email address").click();
  await page.getByPlaceholder("Email address").fill("JohnDoe@test.com");
  await page.getByPlaceholder("Password").click();
  await page.getByPlaceholder("Password").fill("Password123");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByLabel("Global")).toContainText("JD");
  await page.goto("http://localhost:5173/diner-dashboard");
  await expect(page.getByRole("heading")).toContainText("Your pizza kitchen");
  await page.getByRole("link", { name: "Buy one" }).click();
  await expect(page.locator("h2")).toContainText("Awesome is a click away");
  await page.getByRole("link", { name: "home" }).click();
});

test("docs", async ({ page }) => {
  await page.goto("http://localhost:5173/docs");
  await expect(page.getByRole("main")).toContainText("JWT Pizza API");
  await page.getByRole("link", { name: "home" }).click();
  await expect(page.getByRole("heading")).toContainText("The web's best pizza");
});

test("admin dashboard", async ({ page }) => {
  await page.route("*/**/api/auth", async (route) => {
    const loginReq = { email: "a@jwt.com", password: "admin" };
    const loginRes = {
      user: {
        id: 3,
        name: "常用名字",
        email: "a@jwt.com",
        roles: [{ role: "admin" }],
      },
      token: "abcdef",
    };
    expect(route.request().method()).toBe("PUT");
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  // await page.route("*/**/api/franchise", async (route) => {
  //   const franchiseRes = [
  //     {
  //       id: 2,
  //       name: "LotaPizza",
  //       stores: [
  //         { id: 4, name: "Lehi" },
  //         { id: 5, name: "Springville" },
  //         { id: 6, name: "American Fork" },
  //       ],
  //     },
  //     { id: 3, name: "PizzaCorp", stores: [{ id: 7, name: "Spanish Fork" }] },
  //     { id: 4, name: "topSpot", stores: [] },
  //   ];
  //   expect(route.request().method()).toBe("GET");
  //   await route.fulfill({ json: franchiseRes });
  // });

  // await page.route("*/**/api/franchise", async (route) => {
  //   const franchiseReq = {
  //     name: "test franchise",
  //     admins: [{ email: "a@jwt.com" }],
  //   };
  //   const franchiseRes = {
  //     name: "test franchise",
  //     admins: [{ email: "a@jwt.com", id: 4, name: "常用名字" }],
  //     id: 1,
  //   };
  //   expect(route.request().method()).toBe("POST");
  //   expect(route.request().postDataJSON()).toMatchObject(franchiseReq);
  //   await route.fulfill({ json: franchiseRes });
  // });

  // await page.route("*/**/api/franchise/*", async (route) => {
  //   const deleteFranchiseRes = {
  //     message: "Franchise deleted",
  //   };
  //   expect(route.request().method()).toBe("DELETE");
  //   await route.fulfill({ json: deleteFranchiseRes });
  // });

  await page.goto("http://localhost:5173/");
  await expect(page.getByRole("heading")).toContainText("The web's best pizza");
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByPlaceholder("Email address").click();
  await page.getByPlaceholder("Email address").fill("a@jwt.com");
  await page.getByPlaceholder("Password").click();
  await page.getByPlaceholder("Password").fill("admin");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByLabel("Global")).toContainText("常");
  await page.getByRole("link", { name: "Admin" }).click();
  await expect(page.getByRole("heading")).toContainText("Mama Ricci's kitchen");
  await page.goto("http://localhost:5173/admin-dashboard/create-franchise");
  await page.getByPlaceholder("franchise name").click();
  await page.getByPlaceholder("franchise name").fill("test franchise");
  await page.getByPlaceholder("franchisee admin email").click();
  await page.getByPlaceholder("franchisee admin email").fill("a@jwt.com");
  await page.getByRole("button", { name: "Create" }).click();
  // await page.goto("http://localhost:5173");
  //   await expect(page.getByRole("table")).toContainText("test franchise");
  //   await page
  //     .getByRole("row", { name: "test franchise 常用名字 Close" })
  //     .getByRole("button")
  //     .click();
  // await page.goto("http://localhost:5173/admin-dashboard/close-franchise");
  // await expect(page.getByRole("heading")).toContainText("Sorry to see you go");
  // await page.getByRole("button", { name: "Close" }).click();
  // await expect(page.getByRole("main")).not.toContainText("test franchise");
  // await page.getByRole("link", { name: "home" }).click();
  // await expect(page.getByRole("heading")).toContainText("The web's best pizza");
});
