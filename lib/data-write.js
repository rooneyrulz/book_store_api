import fs from 'fs';
import path from 'path';

export async function writeBooks(books) {
  try {
    const data = JSON.stringify(books);

    await fs.writeFile(
      path.resolve(__dirname, '../data', 'books.csv'),
      data,
      err => {
        if (err) throw err;
        console.log(`data successfully written ...`);
      }
    );
  } catch (error) {
    throw error.message;
  }
}
