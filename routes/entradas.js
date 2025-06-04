const express = require('express');
const router = express.Router();
const db = require('../db');

// GET
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT a.id_ficha, a.fecha, a.firma_medico, a.firma_enfermeria,
             b.nombres, b.a_paterno, b.a_materno, b.rut
      FROM ficha a
      JOIN paciente b ON a.id_paciente = b.id_paciente
      WHERE a.firma_medico = 1 OR a.firma_enfermeria = 1
      ORDER BY a.fecha DESC
    `);
    console.log(result.rows)
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener fichas' });
  }
});

// PATCH /api/entradas/:id/desfirmar
router.patch('/:id/desfirmar', async (req, res) => {
    const id_ficha = parseInt(req.params.id);
    const { medico, enfermeria } = req.body;
  
    try {
      const { rows } = await db.query('SELECT * FROM ficha WHERE id_ficha = $1', [id_ficha]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'La ficha no existe' });
      }
      let ficha = rows[0];
      if (medico === true) ficha.firma_medico = 0;
      if (enfermeria === true) ficha.firma_enfermeria = 0;
      await db.query(
        'UPDATE ficha SET firma_medico = $1, firma_enfermeria = $2 WHERE id_ficha = $3',
        [ficha.firma_medico, ficha.firma_enfermeria, id_ficha]
      );
      const { rows: updatedRows } = await db.query('SELECT * FROM ficha WHERE id_ficha = $1', [id_ficha]);
      const fichaActualizada = updatedRows[0];
      console.log('Ficha actualizada:', fichaActualizada);
      return res.json(fichaActualizada);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al actualizar' });
    }
  });
module.exports = router;
