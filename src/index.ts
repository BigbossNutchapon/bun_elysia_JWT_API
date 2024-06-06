import { Elysia, t } from "elysia";
import {
  createBook,
  getBooks,
  getBooksById,
  updateBook,
  createUser,
  getUser,
} from "./model";
import jwt from "@elysiajs/jwt";
import cookie from "@elysiajs/cookie";
import { swagger } from '@elysiajs/swagger'

const app = new Elysia();

//Book API
app.use(
  jwt({
    name: "jwt",
    secret: process.env.JWT_SECRET,
  })
);
app.use(swagger());
app.use(cookie());
app.derive(async ({ jwt, cookie: { token } }) => {
  const profile = await jwt.verify(token.value);
  return {
    profile,
  };
});
app.get("/", () => "Hello Elysia, API alive");
app.guard(
  {
    beforeHandle({ set, profile }) {
      if (!profile) return (set.status = "Unauthorized");
    },
  },
  (app) => {
    app.get("/getBooks", () => getBooks());
    app.get("/getBooks/:id", async ({ jwt, params, profile }) => {
      const bookId = parseInt(params.id);
      console.log("profile", profile);
      return getBooksById(bookId);
    });
    app.post(
      "/books",
      ({ body, set }) => {
        const BookBody: any = body;
        const response = createBook({
          name: BookBody.name,
          author: BookBody.author,
          price: BookBody.price,
        });
        if (response.status === "error") {
          set.status = 400;
          return { message: "Insert failed" };
        }
        return { message: "ok" };
      },
      {
        body: t.Object({
          name: t.String(),
          author: t.String(),
          price: t.Number(),
        }),
        headers: t.Object({
          boss: t.String(),
        }),
      }
    );
    app.put("/books/:id", ({ body, params, set }) => {
      const BookBody: any = body;
      const bookId = parseInt(params.id);
      const response = updateBook(bookId, {
        name: BookBody.name,
        author: BookBody.author,
        price: BookBody.price,
      });
      if (response.status === "error") {
        set.status = 400;
        return { message: "Update failed" };
      }
      return { message: "ok" };
    });
    app.delete("/books/:id", ({ params }) => {
      const bookId = parseInt(params.id);
      return { message: "Delete book with id: " + bookId };
    });
    return app;
  }
);
//User API
app.post(
  "/register",
  async ({ body, set }) => {
    try {
      let userData: any = body;
      userData.password = await Bun.password.hash(userData.password, {
        algorithm: "bcrypt",
        cost: 4,
      });
      createUser(userData);
      return {
        message: "Created user successfully",
      };
    } catch (err) {
      set.status = 400;
      return {
        message: "error",
        error: err,
      };
    }
  },
  {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    }),
  }
);
app.post(
  "/login",
  async ({ body, set, jwt, cookie: { token } }) => {
    try {
      let userData: any = body;
      const response = await getUser(userData);
      if (!response.loggedIn) {
        set.status = 403;
        return {
          message: "Log-in fail",
        };
      }
      token.set({
        value: await jwt.sign({ email: userData.email }),
        httpOnly: true,
        maxAge: 7 * 86400,
        path: "/",
      });
      return {
        message: "Log-in successfully",
        auth: token.value,
      };
    } catch (err) {
      set.status = 400;
      return {
        message: "error",
        error: err,
      };
    }
  },
  {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    }),
  }
);
app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
