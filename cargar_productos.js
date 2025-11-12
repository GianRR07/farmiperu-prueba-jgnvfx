import fs from "fs";
import csv from "csv-parser";
import sqlite3 from "sqlite3";


const db = new sqlite3.Database("./database.db");


db.run(`
  ALTER TABLE productos ADD COLUMN sirve_para TEXT;
`, (err) => {
  if (err && !err.message.includes("duplicate column name")) {
    console.error("❌ Error al agregar columna 'sirve_para':", err.message);
  }
});


fs.createReadStream("productos_otc.csv")
  .pipe(csv({ separator: ";" }))
  .on("data", (row) => {
    const {
      nombre,
      descripcion,
      precio,
      presentacion,
      imagen,
      stock,
      categoria,
      sirve_para,
      otc,
    } = row;

    
    if (!nombre || !descripcion || !precio || !categoria) return;

    db.run(
      `INSERT INTO productos 
       (nombre, descripcion, precio, presentacion, imagen, stock, categoria, sirve_para,otc)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)`,
      [nombre, descripcion, precio, presentacion, imagen, stock, categoria, sirve_para,otc || null]
    );
  })
  .on("end", () => {
    console.log("✅ Productos cargados correctamente desde productos_otc.csv");
  });
