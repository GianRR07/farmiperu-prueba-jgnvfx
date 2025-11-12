import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001; // Usa el puerto asignado por Render

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos', err);
  } else {
    console.log('Conectado a la base de datos SQLite');
  }
});

import path from 'path';

// Servir archivos estáticos generados por Vite
app.use(express.static(path.join(__dirname, 'dist')));

// Redirigir todas las solicitudes a index.html (para un SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});



db.run(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    dni TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    rol TEXT DEFAULT 'cliente'
  )
`, (err) => {
  if (err) {
    console.error('Error al crear la tabla', err);
  } else {
    console.log('Tabla de usuarios creada correctamente');

    const insertAdmin = `
      INSERT OR IGNORE INTO usuarios (nombre, dni, email, password, rol)
      VALUES ('admin', '11111111', 'admin@admin.com', 'admin1.', 'admin')
    `;
    db.run(insertAdmin, (err) => {
      if (err) console.error('Error al insertar el usuario admin', err);
      else console.log('Usuario admin creado correctamente');
    });

    const insertPrueba = `
      INSERT OR IGNORE INTO usuarios (nombre, dni, email, password, rol)
      VALUES ('prueba', '22222222', 'prueba@prueba.com', 'prueba1.', 'cliente')
    `;
    db.run(insertPrueba, (err) => {
      if (err) console.error('Error al insertar el usuario de prueba', err);
      else console.log('Usuario de prueba creado correctamente');
    });
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    descripcion TEXT,
    precio REAL,
    presentacion TEXT,
    imagen TEXT,
    stock INTEGER DEFAULT 0,
    categoria TEXT,
    sirve_para TEXT,
    otc INTEGER DEFAULT 0
  )
`, (err) => {
  if (err) console.error('Error al crear la tabla de productos', err);
  else console.log('Tabla de productos creada correctamente (con campo OTC)');
});

db.run(`
  CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paypal_order_id TEXT,
    total_pen REAL,
    total_usd REAL,
    moneda_paypal TEXT,
    estado TEXT,
    fecha TEXT,
    usuario_email TEXT,
    usuario_dni TEXT,
    guest_nombre TEXT,
    guest_email TEXT,
    guest_telefono TEXT,
    guest_dni TEXT,
    paypal_payer_id TEXT,
    paypal_payer_email TEXT,
    shipping_address_json TEXT
  )
`, (err) => {
  if (err) console.error('Error al crear tabla pedidos', err);
  else console.log('Tabla pedidos creada correctamente');
});

db.run(`
  CREATE TABLE IF NOT EXISTS pedido_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER,
    producto_id INTEGER,
    nombre TEXT,
    precio_pen REAL,
    qty INTEGER,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
  )
`, (err) => {
  if (err) console.error('Error al crear tabla pedido_items', err);
  else console.log('Tabla pedido_items creada correctamente');
});


app.get('/usuarios', (req, res) => {
  const query = 'SELECT * FROM usuarios';
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).send('Error al obtener los usuarios');
    res.status(200).json(rows);
  });
});

app.post('/registro', (req, res) => {
  const { nombre, dni, email, password, rol } = req.body;

  if (!nombre || !dni || !email || !password) {
    return res.status(400).send('Todos los campos son requeridos');
  }

  const rolFinal = rol || 'cliente';
  const query = 'INSERT INTO usuarios (nombre, dni, email, password, rol) VALUES (?, ?, ?, ?, ?)';
  db.run(query, [nombre, dni, email, password, rolFinal], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed: usuarios.email')) {
        return res.status(409).send('El correo ya está registrado');
      }
      if (err.message.includes('UNIQUE constraint failed: usuarios.dni')) {
        return res.status(409).send('El DNI ya está registrado');
      }
      return res.status(500).send('Error al registrar el usuario');
    }
    res.status(201).send({ message: 'Usuario registrado correctamente' });
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email y contraseña son requeridos');
  }

  const query = 'SELECT * FROM usuarios WHERE email = ?';
  db.get(query, [email], (err, row) => {
    if (err) return res.status(500).send('Error al verificar las credenciales');
    if (!row || row.password !== password) return res.status(401).send('Credenciales incorrectas');

    res.status(200).json({
      message: 'Login exitoso',
      nombre: row.nombre,
      rol: row.rol,
      dni: row.dni,
      email: row.email
    });
  });
});


app.post('/productos', (req, res) => {
  const { nombre, descripcion, precio, presentacion, imagen, stock, categoria, sirve_para, otc } = req.body;

  if (!nombre || !descripcion || !precio || !presentacion || !imagen || stock === undefined || !categoria) {
    return res.status(400).send('Todos los campos son requeridos');
  }

  const query = `
    INSERT INTO productos (nombre, descripcion, precio, presentacion, imagen, stock, categoria, sirve_para, otc)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.run(
    query,
    [nombre, descripcion, precio, presentacion, imagen, stock, categoria, sirve_para ?? null, otc ? 1 : 0],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).send('Error al registrar el producto');
      }
      res.status(201).send({ message: 'Producto registrado correctamente' });
    }
  );
});

app.get('/productos', (req, res) => {
  const query = `
    SELECT id, nombre, descripcion, precio, presentacion, imagen, stock, categoria, otc
    FROM productos
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).send('Error al obtener los productos');
    res.status(200).json(rows);
  });
});


app.get('/admin/productos', (req, res) => {
  const query = 'SELECT * FROM productos';
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).send('Error al obtener productos (admin)');
    res.status(200).json(rows);
  });
});

app.put('/productos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, presentacion, imagen, stock, categoria, sirve_para, otc } = req.body;

  if (!nombre || !descripcion || !precio || !presentacion || !imagen || stock === undefined || !categoria) {
    return res.status(400).send('Todos los campos son requeridos');
  }

  const query = `
    UPDATE productos
    SET nombre = ?, descripcion = ?, precio = ?, presentacion = ?, imagen = ?, stock = ?, categoria = ?, sirve_para = ?, otc = ?
    WHERE id = ?
  `;
  db.run(
    query,
    [nombre, descripcion, precio, presentacion, imagen, stock, categoria, sirve_para ?? null, otc ? 1 : 0, id],
    function (err) {
      if (err) {
        console.error('Error al actualizar producto:', err);
        return res.status(500).send('Error al actualizar el producto');
      }
      if (this.changes === 0) return res.status(404).send('Producto no encontrado');
      res.status(200).send({ message: 'Producto actualizado correctamente' });
    }
  );
});

app.delete('/productos/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM productos WHERE id = ?';
  db.run(query, [id], function (err) {
    if (err) return res.status(500).send('Error al eliminar el producto');
    if (this.changes === 0) return res.status(404).send('Producto no encontrado');
    res.status(200).send('Producto eliminado correctamente');
  });
});


app.delete('/reset-productos', (req, res) => {
  db.run('DELETE FROM productos', (err) => {
    if (err) return res.status(500).send('Error al limpiar la tabla');
    res.send('Tabla productos vaciada');
  });
});


app.post('/orders', (req, res) => {
  try {
    const {
      paypalOrderId,
      items,
      totalPEN,
      totalUSD,
      paypalCurrency = 'USD',
      estado = 'aprobado',
      usuarioEmail,
      usuarioDni,
      guestNombre,
      guestEmail,
      guestTelefono,
      guestDni,
      paypalPayerId,
      paypalPayerEmail,
      shippingAddressJson
    } = req.body;

    if (!paypalOrderId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Datos de pedido incompletos' });
    }

    const fecha = new Date().toISOString();

    db.run(
      `INSERT INTO pedidos (
        paypal_order_id, total_pen, total_usd, moneda_paypal, estado, fecha,
        usuario_email, usuario_dni,
        guest_nombre, guest_email, guest_telefono, guest_dni,
        paypal_payer_id, paypal_payer_email, shipping_address_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        paypalOrderId, totalPEN ?? null, totalUSD ?? null, paypalCurrency, estado, fecha,
        usuarioEmail ?? null, usuarioDni ?? null,
        guestNombre ?? null, guestEmail ?? null, guestTelefono ?? null, guestDni ?? null,
        paypalPayerId ?? null, paypalPayerEmail ?? null, shippingAddressJson ?? null
      ],
      function (err) {
        if (err) {
          console.error('Error insertando pedido:', err);
          return res.status(500).json({ error: 'No se pudo guardar el pedido' });
        }
        const pedidoId = this.lastID;

        const stmt = db.prepare(
          `INSERT INTO pedido_items (pedido_id, producto_id, nombre, precio_pen, qty)
           VALUES (?, ?, ?, ?, ?)`
        );
        for (const it of items) {
          stmt.run([pedidoId, it.id, it.nombre, Number(it.precio), Number(it.qty || 1)]);
          db.run(
            `UPDATE productos SET stock = stock - ? WHERE id = ? AND stock >= ?`,
            [Number(it.qty || 1), it.id, Number(it.qty || 1)]
          );
        }
        stmt.finalize(e2 => {
          if (e2) {
            console.error('Error insertando items:', e2);
            return res.status(500).json({ error: 'No se pudo guardar los ítems' });
          }
          return res.status(201).json({ message: 'Pedido guardado', pedidoId });
        });
      }
    );
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Error interno al guardar pedido' });
  }
});

app.get('/reports/sales', (req, res) => {
  const { granularity = 'day', start, end } = req.query;

  const where = [];
  const params = [];
  if (start) { where.push("date(fecha) >= date(?)"); params.push(start); }
  if (end) { where.push("date(fecha) <= date(?)"); params.push(end); }
  const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

  let groupExpr;
  switch (granularity) {
    case 'day': groupExpr = `strftime('%Y-%m-%d', fecha)`; break;
    case 'week': groupExpr = `strftime('%Y', fecha) || '-W' || strftime('%W', fecha)`; break;
    case 'month': groupExpr = `strftime('%Y-%m', fecha)`; break;
    case 'year': groupExpr = `strftime('%Y', fecha)`; break;
    default: return res.status(400).json({ error: 'granularity inválida' });
  }

  const sql = `
    SELECT
      ${groupExpr} AS periodo,
      COUNT(*) AS pedidos,
      COALESCE(SUM(total_pen), 0) AS total_pen,
      COALESCE(SUM(total_usd), 0) AS total_usd
    FROM pedidos
    ${whereSQL}
    GROUP BY periodo
    ORDER BY periodo ASC
  `;

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Error generando reporte:', err);
      return res.status(500).json({ error: 'No se pudo generar el reporte' });
    }
    res.json(rows);
  });
});

app.get('/orders', (req, res) => {
  const { start, end, q = '', limit = 100, offset = 0 } = req.query;

  const where = [];
  const params = [];

  if (start) { where.push("date(fecha) >= date(?)"); params.push(start); }
  if (end) { where.push("date(fecha) <= date(?)"); params.push(end); }
  if (q) {
    where.push(`(
      (usuario_email IS NOT NULL AND usuario_email LIKE ?)
      OR (usuario_dni IS NOT NULL AND usuario_dni LIKE ?)
      OR (guest_nombre IS NOT NULL AND guest_nombre LIKE ?)
      OR (guest_email IS NOT NULL AND guest_email LIKE ?)
      OR (guest_dni IS NOT NULL AND guest_dni LIKE ?)
      OR (paypal_order_id LIKE ?)
    )`);
    const like = `%${q}%`;
    params.push(like, like, like, like, like, like);
  }

  const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const sqlOrders = `
    SELECT *
    FROM pedidos
    ${whereSQL}
    ORDER BY datetime(fecha) DESC
    LIMIT ? OFFSET ?
  `;
  params.push(Number(limit), Number(offset));

  db.all(sqlOrders, params, (err, orders) => {
    if (err) {
      console.error('Error consultando pedidos:', err);
      return res.status(500).json({ error: 'No se pudieron obtener los pedidos' });
    }
    if (!orders.length) {
      return res.json([]);
    }

    const ids = orders.map(o => o.id);
    const placeholders = ids.map(() => '?').join(',');
    const sqlItems = `SELECT * FROM pedido_items WHERE pedido_id IN (${placeholders})`;

    db.all(sqlItems, ids, (err2, items) => {
      if (err2) {
        console.error('Error consultando items:', err2);
        return res.status(500).json({ error: 'No se pudieron obtener los ítems' });
      }

      const itemsByPedido = {};
      for (const it of items) {
        if (!itemsByPedido[it.pedido_id]) itemsByPedido[it.pedido_id] = [];
        itemsByPedido[it.pedido_id].push(it);
      }

      const enriched = orders.map(o => ({
        ...o,
        items: itemsByPedido[o.id] || []
      }));

      res.json(enriched);
    });
  });
});

app.get('/orders/by-user', (req, res) => {
  const { email, dni, limit = 200, offset = 0 } = req.query;

  if (!email && !dni) {
    return res.status(400).json({ error: 'Se requiere email o dni' });
  }

  const where = [];
  const params = [];

  where.push('(usuario_email IS NOT NULL OR usuario_dni IS NOT NULL)');
  if (email) { where.push('usuario_email = ?'); params.push(email); }
  if (dni) { where.push('usuario_dni = ?'); params.push(dni); }

  const whereSQL = `WHERE ${where.join(' AND ')}`;

  const sqlOrders = `
    SELECT *
    FROM pedidos
    ${whereSQL}
    ORDER BY datetime(fecha) DESC
    LIMIT ? OFFSET ?
  `;
  params.push(Number(limit), Number(offset));

  db.all(sqlOrders, params, (err, orders) => {
    if (err) {
      console.error('Error consultando pedidos por usuario:', err);
      return res.status(500).json({ error: 'No se pudieron obtener los pedidos' });
    }
    if (!orders.length) return res.json([]);

    const ids = orders.map(o => o.id);
    const placeholders = ids.map(() => '?').join(',');
    const sqlItems = `SELECT * FROM pedido_items WHERE pedido_id IN (${placeholders})`;

    db.all(sqlItems, ids, (err2, items) => {
      if (err2) {
        console.error('Error consultando items:', err2);
        return res.status(500).json({ error: 'No se pudieron obtener los ítems' });
      }
      const itemsByPedido = {};
      for (const it of items) {
        if (!itemsByPedido[it.pedido_id]) itemsByPedido[it.pedido_id] = [];
        itemsByPedido[it.pedido_id].push(it);
      }
      const enriched = orders.map(o => ({ ...o, items: itemsByPedido[o.id] || [] }));
      res.json(enriched);
    });
  });
});


app.get('/', (req, res) => {
  res.send('¡Backend funcionando correctamente!');
});

app.listen(port, () => {
  console.log(`Servidor Express corriendo en http://localhost:${port}`);
});



const SYSTEM_RULES = `
Eres un asistente de farmacia. RESPONDE EN ESPAÑOL.
Reglas:
- Solo sugiere productos OTC del catálogo dado.
- Nunca sugieras prescripción, antibióticos, corticoides sistémicos, ni diagnósticos.
- Si detectas emergencia o caso severo (fracturas, sangrado, dificultad para respirar, alergia grave, golpe fuerte en la cabeza, pérdida de consciencia, dolor intenso, niños <2 años, embarazo con síntoma grave), di que debe ir a urgencias o hablar con un profesional.
- Smalltalk: si el usuario dice "gracias", responde breve y amable; saludos = saludo breve; ubicación/horarios/contacto = remite a "Contacto" del sitio; “hablar con humano” = ofrece asesor.
- Recomendaciones: máx 3 opciones, cada una en una línea (usa salto de línea entre opciones).
- Prioriza coincidencia por “sirve_para”/categoría.
- Devuelve SOLO productos del catálogo (OTC) y claramente relacionados. PROHIBIDO sugerir remedios caseros o productos fuera del catálogo.
- En la lista de opciones, escribe únicamente el NOMBRE EXACTO del producto tal como aparece en el catálogo (sin paréntesis ni descriptores). Ejemplo: "1) Paracetamol 500 mg".
- Si solo hay 1 o 2 relevantes, devuelve 1 o 2. NUNCA rellenes con opciones tangenciales.
- Un producto es “relevante” si su campo sirve_para o descripción contiene el síntoma (o sinónimos) de forma explícita.
- Si no hay opciones claras, di: "Tu consulta parece requerir una evaluación más específica. Debes comunicarte con un asesor de la farmacia, escribe a corporacionqf@farmaciasperu.pe."
- Formato de salida SIEMPRE:
  * Si es smalltalk/informativo: una sola línea breve.
  * Si recomiendas: "Puedo sugerirte algunas opciones:" y luego líneas tipo "1) Nombre del producto".
`;


function productsToContext(rows) {
  return rows
    .map(p => {
      const shortDesc = (p.descripcion || "").replace(/\s+/g, " ").trim().slice(0, 140);
      return `- ${p.nombre}${p.presentacion ? " " + p.presentacion : ""} | cat: ${p.categoria || ""} | OTC: ${Number(p.otc) === 1 ? "sí" : "no"} | sirve_para: ${p.sirve_para || ""}${shortDesc ? " | desc: " + shortDesc : ""}`;
    })
    .join("\n");
}




function filterByHeuristics(all, userText) {
  return all;
}


function extractSymptomTokens(userText = "") {
  const t = userText
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const tokens = (t.match(/[a-záéíóúñ0-9]{3,}/gi) || []).slice(0, 8);
  return tokens.length ? tokens : [];
}

function relevanceScore(prod, tokens) {
  const blob = `${prod.nombre} ${prod.descripcion || ""} ${prod.sirve_para || ""}`
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  let score = 0;
  for (const tk of tokens) if (blob.includes(tk)) score += 1;
  return score;
}

function filterRelevantProducts(all, userText) {
  const tokens = extractSymptomTokens(userText);
  const scored = all
    .map(p => ({ p, s: relevanceScore(p, tokens) }))
    .sort((a, b) => b.s - a.s);

  const top = (scored.length ? scored : all.map(p => ({ p, s: 0 })))
    .slice(0, 10)
    .map(x => x.p);

  return top;
}



const SMALLTALK = {
  greeting: ["hola", "buenas", "buenos dias", "buenos días", "buenas tardes", "buenas noches", "hey", "qué tal", "que tal"],
  thanks: ["gracias", "muchas gracias", "mil gracias", "te lo agradezco", "thank you"],
  bye: ["adios", "adiós", "hasta luego", "nos vemos", "chau", "chao", "bye"],
  location: ["donde estan", "dónde están", "ubicacion", "ubicación", "direccion", "dirección", "como llegar", "mapa", "tienda fisica", "tienda física"],
  contact: ["contacto", "numero", "número", "whatsapp", "correo", "email", "atención", "atencion", "hablar con alguien"],
  hours: ["horario", "a que hora", "a qué hora", "abren", "cierran", "abierto", "cerrado"],
  shipping: ["envio", "envío", "delivery", "reparto", "a domicilio", "llegan a", "cobertura"],
  payment: ["pago", "pagos", "tarjeta", "efectivo", "paypal", "yape", "plin", "transferencia"],
  human: ["humano", "asesor", "agente", "hablar con", "persona real"],
  privacy: [
    "privacidad", "disclaimer", "aviso", "aviso de privacidad", "proteccion de datos",
    "protección de datos", "datos personales", "guardan mis datos", "recopilan datos",
    "politica de privacidad", "política de privacidad", "seguridad", "confidencialidad"
  ]
};

function smalltalkFastPath(textRaw) {
  const norm = (textRaw || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const matchIn = arr => arr.some(k => norm.includes(k));
  if (matchIn(SMALLTALK.greeting)) return "¡Hola! ¿En qué puedo ayudarte hoy?";
  if (matchIn(SMALLTALK.thanks)) return "¡Me alegra haber ayudado! 😊";
  if (matchIn(SMALLTALK.bye)) return "¡Hasta luego! Si necesitas algo, aquí estaré.";
  if (matchIn(SMALLTALK.location)) return "Puedes ver dirección y mapa en el área de Contacto del sitio.";
  if (matchIn(SMALLTALK.contact)) return "Nuestra información de contacto está en la sección Contacto. También atendemos por el correo : corporacionqf@farmaciasperu.pe.";
  if (matchIn(SMALLTALK.hours)) return "Nuestro horario está en Contacto.";
  if (matchIn(SMALLTALK.shipping)) return "Hacemos envíos locales. Revisa Contacto para cobertura y tiempos.";
  if (matchIn(SMALLTALK.payment)) return "Aceptamos pagos en línea y en tienda (ver detalles en tu cuenta o en Contacto).";
  if (matchIn(SMALLTALK.human)) return "Te proveere el correo de contacto de farmiperu , atienden rapidamente , corporacionqf@farmaciasperu.pe.";
  if (matchIn(SMALLTALK.privacy)) {
    return "🛡️ Aviso de privacidad: Este asistente no almacena tu historia clínica ni datos médicos sensibles. No compartimos tus mensajes con terceros con fines publicitarios. Tus consultas se realizan de forma anonima. Esto no sustituye la orientación de un profesional de salud. En caso de emergencia, acude a un servicio de urgencias.";
  }
  return null;
}
app.get('/usuarios/:id/direccion', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT direccion FROM usuarios WHERE dni = ? OR email = ?';
  db.get(query, [id, id], (err, row) => {
    if (err) {
      console.error('Error al obtener dirección:', err);
      return res.status(500).json({ error: 'Error al obtener dirección' });
    }
    if (!row) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(row);
  });
});

app.put("/usuarios/:id/direccion", (req, res) => {
  const { id } = req.params;
  const { direccion } = req.body;

  if (!direccion) {
    return res.status(400).json({ error: "La dirección es requerida" });
  }

  const query = `UPDATE usuarios SET direccion = ? WHERE dni = ? OR email = ?`;
  db.run(query, [direccion, id, id], function (err) {
    if (err) {
      console.error("Error al actualizar dirección:", err);
      return res.status(500).json({ error: "Error al guardar la dirección" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json({ message: "Dirección guardada correctamente" });
  });
});

function normalizeForMatch(s = "") {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
    .replace(/(\d+)\s*mg\b/g, "$1mg")                 
    .replace(/[^a-z0-9]+/g, "")                       
    .trim();
}

function findProductByName(all = [], rawQuery = "") {
  const qNorm = normalizeForMatch(rawQuery);
  if (!qNorm) return null;

  const scored = all.map(p => {
    const nNorm = normalizeForMatch(p.nombre || "");
    let score = 0;
    if (!nNorm) return { p, score };

    if (nNorm === qNorm) score = 100;
    else if (nNorm.includes(qNorm) || qNorm.includes(nNorm)) score = 80;
    else {
      const qTokens = (qNorm.match(/[a-z0-9]+/g) || []);
      const nTokens = new Set(nNorm.match(/[a-z0-9]+/g) || []);
      let overlap = 0;
      for (const t of qTokens) if (nTokens.has(t)) overlap++;
      score = overlap; 
    }
    return { p, score };
  }).sort((a, b) => b.score - a.score);

  return (scored[0] && scored[0].score >= 2) ? scored[0].p : null;
}

app.get("/chat-llm", async (req, res) => {
  try {
    const qRaw = (req.query.q || "").trim();
    if (!qRaw) return res.json({ reply: "¿En qué puedo ayudarte?" });

    const fast = smalltalkFastPath(qRaw);
    if (fast) return res.json({ reply: fast });

    const emergRegex = /(fractur|hueso roto|sangrado|hemorragia|dificultad para respirar|ahogo|alergia grave|anafilaxi|golpe fuerte en la cabeza|pérdida de consciencia|perdida de consciencia|dolor intenso|dolor insoportable|convulsión|convulsion|niñ[oa]s?\s*menores?\s*de\s*2\s*años|embarazo.*(dolor|sangrado|fiebre))/i;
    if (emergRegex.test(qRaw)) {
      return res.json({
        reply:
          "Tu consulta parece requerir una evaluación más específica. Debes comunicarte con un asesor de la farmacia, escribe a corporacionqf@farmaciasperu.pe."
      });
    }

    const all = await new Promise((resolve, reject) => {
      db.all(
        "SELECT id, nombre, descripcion, presentacion, categoria, sirve_para, otc FROM productos",
        [],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows || []);
        }
      );
    });

    const pool = all;


    const infoRegexes = [
      /para\s*qu[eé]\s*sirve\s+(el|la|los|las)?\s*(.+)$/i,
      /qu[eé]\s*hace\s+(el|la|los|las)?\s*(.+)$/i,
      /(indicaciones|usos|uso)\s+(de(l|la|los|las)?\s*)?(.+)$/i,  
      /(indicaciones|usos|uso)\s+para\s+(.+)$/i,                 
      /^(.+?)\s+para\s+qu[eé]\s*sirve$/i
    ];

    let askedProduct = null;
    for (const rgx of infoRegexes) {
      const m = qRaw.match(rgx);
      if (m) {
        askedProduct = (m[m.length - 1] || "").trim();
        break;
      }
    }

    if (askedProduct) {
      const prod = findProductByName(all, askedProduct);
      if (prod) {
        const desc = (prod.descripcion || "").trim();
        const sirve = (prod.sirve_para || "").trim();
        const lines = [];
        lines.push(`**${prod.nombre}${prod.presentacion ? " " + prod.presentacion : ""}**`);
        if (desc) lines.push(desc);
        if (sirve) lines.push(`Sirve para: ${sirve}.`);

        if (Number(prod.otc) !== 1) {
          lines.push("Nota: Este producto no es de venta libre (OTC). Para su uso o compra, consulta con un profesional de salud o comunícate con un asesor de la farmacia (corporacionqf@farmaciasperu.pe).");
        }

        return res.json({ reply: lines.join("\n") });
      }

    }





    const shortlist = filterRelevantProducts(pool, qRaw);
    if (!shortlist || shortlist.length === 0) {
      return res.json({
        reply:
          "Tu consulta parece requerir una evaluación más específica. Debes comunicarte con un asesor de la farmacia, escribe a corporacionqf@farmaciasperu.pe."
      });
    }

    const top = shortlist.slice(0, 3); 
    const ctx = productsToContext(top);


    const prompt = `
Contexto (catálogo OTC):
${ctx}

Consulta del usuario: "${qRaw}"

Recuerda seguir las REGLAS del sistema. Responde con el formato exigido.
`;

    const r = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemma3:4b",
        prompt: `${SYSTEM_RULES}\n\n${prompt}`,
        stream: false,
        options: {
          temperature: 0.2,
          num_predict: 256
        }
      })
    });

    const data = await r.json();
    const reply =
      (data && data.response && String(data.response).trim()) ||
      "Tu consulta parece requerir una evaluación más específica. Debes comunicarte con un asesor de la farmacia, escribe a corporacionqf@farmaciasperu.pe.";

    return res.json({ reply });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      reply:
        "Hubo un problema al procesar tu consulta. Intenta nuevamente."
    });
  }
});
