import { Database } from "bun:sqlite";

const db = new Database("mydb.sqlite");

const getBooks = () => {
    try {
        const query = db.query(`SELECT * FROM books`);
        return query.all();
    }
    catch (err) {
        console.log(err);
        return {};
    }
}

const getBooksById = (id: number) => {
    try {
        const query = db.query(`SELECT * FROM books WHERE id = $id;`);
        return query.get({
            $id: id
        });
    }
    catch (err) {
        console.log(err);
        return {};
    }
}

const createBook = (book: any) => {
    try {
        if(!book.name || !book.author || !book.price) {
            throw new Error("Validation failed");
        }
        const query = db.query(`INSERT INTO Books
        ("name", "author", "price")
        VALUES ($name, $author, $price);`);
        query.run({
            $name: book.name,
            $author: book.author,
            $price: book.price
        });
        return {
            status: "ok"
        };
    } catch (err) {
        console.log(err);
        return {
            status: "error", err
        };
    }
}

const updateBook = (id: number, book: any) => {
    try {
        if(!book.name || !book.author || !book.price) {
            throw new Error("Validation failed");
        }
        const query = db.query(`
        UPDATE Books SET "name" = $name, "author" = $author, "price" = $price WHERE id = $id;`);
        query.run({
            $id: id,
            $name: book.name,
            $author: book.author,
            $price: book.price
        })
        return {
            status: "ok"
        }
    } catch (err) {
        console.log(err);
        return {
            status: "error", err
        }
    }
}

const deleteBook = (id: number) => {
    try {
        const query = db.query(`DELETE FROM Books WHERE id = $id;`);
        query.run({
            $id: id
        })
        return {
            status: "ok"
        }
    } catch (err) {
        console.log(err);
        return {
            status: "error", err
        }
    }
}


const createUser = (user: any) => {
    try {
        const query = db.query(`INSERT INTO Users
        ("email", "password")
        VALUES ($email, $password);`);
        query.run({
            $email: user.email,
            $password: user.password,
        })
    } catch (err) {
        console.log(err);
    }
}

const getUser = async (user: any) => {
    try {
        const query = db.query(`SELECT * FROM Users
        WHERE email = $email`);
        const userData: any = query.get({
            $email: user.email
        })
        const isMatch = await Bun.password.verify(user.password, userData.password);
        if(!isMatch){
            throw new Error("User not found");
        }
        
        return {
            loggedIn: true
        }
    } catch (err) {
        console.log(err);
        return {
            loggedIn: false
        };
    }
}

export { getBooks, getBooksById, createBook, updateBook, deleteBook, createUser, getUser };