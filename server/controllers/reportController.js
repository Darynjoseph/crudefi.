const pool = require('../db');

exports.getTotalCasualSalary = async (req, res) => {
  try {
    const { start, end } = req.query;

    let query = `SELECT SUM(salary_amount) AS total FROM casual_staff_salary WHERE 1=1`;
    const params = [];

    if (start) {
      params.push(start);
      query += ` AND date >= $${params.length}`;
    }

    if (end) {
      params.push(end);
      query += ` AND date <= $${params.length}`;
    }

    const result = await pool.query(query, params);
    res.json({ total_salary_paid: result.rows[0].total || 0 });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error generating salary report' });
  }
};

exports.getTotalPettyCash = async (req, res) => {
  try {
    const { start, end } = req.query;

    let query = `SELECT SUM(amount) AS total FROM petty_cash WHERE 1=1`;
    const params = [];

    if (start) {
      params.push(start);
      query += ` AND date >= $${params.length}`;
    }

    if (end) {
      params.push(end);
      query += ` AND date <= $${params.length}`;
    }

    const result = await pool.query(query, params);
    res.json({ total_petty_cash: result.rows[0].total || 0 });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error generating petty cash report' });
  }
};

exports.getFruitProcurementSummary = async (req, res) => {
  try {
    const { start, end } = req.query;

    let query = `
      SELECT 
        fruit_type,
        SUM(weight) AS total_weight,
        ROUND(AVG(price_per_kg), 2) AS avg_price_per_kg,
        SUM(total_cost) AS total_cost
      FROM fruit_deliveries
      WHERE 1=1
    `;
    const params = [];

    if (start) {
      params.push(start);
      query += ` AND date >= $${params.length}`;
    }

    if (end) {
      params.push(end);
      query += ` AND date <= $${params.length}`;
    }

    query += ` GROUP BY fruit_type ORDER BY fruit_type`;

    const result = await pool.query(query, params);
    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error generating fruit summary' });
  }
};


exports.getOilProductionSummary = async (req, res) => {
  try {
    const { start, end } = req.query;

    let query = `
      SELECT 
        fruit_type,
        SUM(input_quantity) AS total_input_kg,
        SUM(oil_extracted) AS total_oil_liters,
        SUM(waste) AS total_waste_kg,
        ROUND(SUM(oil_extracted) / NULLIF(SUM(input_quantity), 0), 2) AS yield_rate
      FROM oil_extraction_logs
      WHERE 1=1
    `;
    const params = [];

    if (start) {
      params.push(start);
      query += ` AND date >= $${params.length}`;
    }

    if (end) {
      params.push(end);
      query += ` AND date <= $${params.length}`;
    }

    query += ` GROUP BY fruit_type ORDER BY fruit_type`;

    const result = await pool.query(query, params);
    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error generating oil summary' });
  }
};


exports.getMonthlySummary = async (req, res) => {
  try {
    const { start, end } = req.query;
    const params = [];
    const dateFilter = [];

    if (start) {
      params.push(start);
      dateFilter.push(`date >= $${params.length}`);
    }
    if (end) {
      params.push(end);
      dateFilter.push(`date <= $${params.length}`);
    }

    const whereClause = dateFilter.length > 0 ? `WHERE ${dateFilter.join(' AND ')}` : '';

    const queries = {
      pettyCash: `SELECT COALESCE(SUM(amount), 0) AS total FROM petty_cash ${whereClause}`,
      miscExpenses: `SELECT COALESCE(SUM(total_cost), 0) AS total FROM misc_expenses ${whereClause}`,
      casualSalary: `SELECT COALESCE(SUM(salary_amount), 0) AS total FROM casual_staff_salary ${whereClause}`,
      fruitPurchases: `SELECT COALESCE(SUM(total_cost), 0) AS total FROM fruit_deliveries ${whereClause}`,
      oilProduction: `SELECT 
          COALESCE(SUM(input_quantity), 0) AS total_input_kg,
          COALESCE(SUM(oil_extracted), 0) AS total_oil_liters,
          COALESCE(SUM(waste), 0) AS total_waste_kg
        FROM oil_extraction_logs ${whereClause}`
    };

    const [petty, misc, salary, fruit, oil] = await Promise.all([
      pool.query(queries.pettyCash, params),
      pool.query(queries.miscExpenses, params),
      pool.query(queries.casualSalary, params),
      pool.query(queries.fruitPurchases, params),
      pool.query(queries.oilProduction, params)
    ]);

    res.json({
      period: { start, end },
      expenses: {
        petty_cash: petty.rows[0].total,
        misc_expenses: misc.rows[0].total,
        casual_staff_salary: salary.rows[0].total,
        fruit_purchases: fruit.rows[0].total
      },
      oil_production: {
        total_input_kg: oil.rows[0].total_input_kg,
        total_oil_liters: oil.rows[0].total_oil_liters,
        total_waste_kg: oil.rows[0].total_waste_kg
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error generating monthly report' });
  }
};

exports.getExpenseTrend = async (req, res) => {
  try {
    const { start, end } = req.query;
    const params = [];
    const whereClause = [];

    if (start) {
      params.push(start);
      whereClause.push(`date >= $${params.length}`);
    }

    if (end) {
      params.push(end);
      whereClause.push(`date <= $${params.length}`);
    }

    const filter = whereClause.length ? `WHERE ${whereClause.join(' AND ')}` : '';

    const query = `
      SELECT date, SUM(total) AS daily_total FROM (
        SELECT date, amount AS total FROM petty_cash ${filter}
        UNION ALL
        SELECT date, total_cost AS total FROM misc_expenses ${filter}
        UNION ALL
        SELECT date, salary_amount AS total FROM casual_staff_salary ${filter}
        UNION ALL
        SELECT date, total_cost AS total FROM fruit_deliveries ${filter}
      ) AS combined
      GROUP BY date
      ORDER BY date ASC
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate expense trend data' });
  }
};

exports.getFruitTypeBreakdown = async (req, res) => {
  try {
    const { start, end } = req.query;
    const params = [];
    const filters = [];

    if (start) {
      params.push(start);
      filters.push(`date >= $${params.length}`);
    }
    if (end) {
      params.push(end);
      filters.push(`date <= $${params.length}`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const query = `
      SELECT 
        fruit_type,
        SUM(weight) AS total_kg,
        SUM(total_cost) AS total_cost
      FROM fruit_deliveries
      ${whereClause}
      GROUP BY fruit_type
      ORDER BY total_kg DESC
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error generating fruit type breakdown' });
  }
};

  
exports.getOilYieldTrend = async (req, res) => {
  try {
    const { start, end } = req.query;
    const params = [];
    const filters = [];

    if (start) {
      params.push(start);
      filters.push(`date >= $${params.length}`);
    }
    if (end) {
      params.push(end);
      filters.push(`date <= $${params.length}`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const query = `
      SELECT
        date,
        fruit_type,
        input_quantity AS input_kg,
        oil_extracted AS oil_liters,
        waste,
        ROUND((oil_extracted / NULLIF(input_quantity, 0)) * 100, 2) AS yield_percent
      FROM oil_extraction_logs
      ${whereClause}
      ORDER BY date ASC
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate oil yield trend data' });
  }
};


const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

exports.exportPettyCashToExcel = async (req, res) => {
  try {
    const { start, end } = req.query;
    const params = [];
    const filters = [];

    if (start) {
      params.push(start);
      filters.push(`date >= $${params.length}`);
    }
    if (end) {
      params.push(end);
      filters.push(`date <= $${params.length}`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const query = `
      SELECT id, date, description, amount, spent_by, category_id, approved_by, notes
      FROM petty_cash
      ${whereClause}
      ORDER BY date DESC
    `;

    const result = await pool.query(query, params);

    const worksheet = XLSX.utils.json_to_sheet(result.rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'PettyCash');

    const filePath = path.join(__dirname, '../exports/petty_cash_export.xlsx');
    XLSX.writeFile(workbook, filePath);

    res.download(filePath, 'petty_cash_export.xlsx', err => {
      if (err) {
        console.error('Download error:', err);
      }
      fs.unlinkSync(filePath); // delete after sending
    });

  } catch (err) {
    console.error('Excel export failed:', err);
    res.status(500).json({ error: 'Failed to export petty cash to Excel' });
  }
};

exports.exportCasualStaffToExcel = async (req, res) => {
  try {
    const { start, end } = req.query;
    const params = [];
    const filters = [];

    if (start) {
      params.push(start);
      filters.push(`date >= $${params.length}`);
    }
    if (end) {
      params.push(end);
      filters.push(`date <= $${params.length}`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const query = `
      SELECT id, date, staff_name, id_number, shift_start, shift_end, duration,
             rate_per_shift, salary_amount, team_name, approved_by, notes
      FROM casual_staff_salary
      ${whereClause}
      ORDER BY date DESC
    `;

    const result = await pool.query(query, params);

    const worksheet = XLSX.utils.json_to_sheet(result.rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'CasualStaff');

    const filePath = path.join(__dirname, '../exports/casual_staff_export.xlsx');
    XLSX.writeFile(workbook, filePath);

    res.download(filePath, 'casual_staff_export.xlsx', err => {
      if (err) console.error(err);
      fs.unlinkSync(filePath);
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to export casual staff data' });
  }
};



exports.exportFruitDeliveriesToExcel = async (req, res) => {
  try {
    const { start, end } = req.query;
    const params = [];
    const filters = [];

    if (start) {
      params.push(start);
      filters.push(`date >= $${params.length}`);
    }
    if (end) {
      params.push(end);
      filters.push(`date <= $${params.length}`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const query = `
      SELECT id, date, supplier_name, supplier_vehicle_no, supplier_contact, fruit_type, weight, price_per_kg, total_cost, ticket_no, approved_by
      FROM fruit_deliveries
      ${whereClause}
      ORDER BY date DESC
    `;

    const result = await pool.query(query, params);

    const worksheet = XLSX.utils.json_to_sheet(result.rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'FruitDeliveries');

    const filePath = path.join(__dirname, '../exports/fruit_deliveries_export.xlsx');
    XLSX.writeFile(workbook, filePath);

    res.download(filePath, 'fruit_deliveries_export.xlsx', err => {
      if (err) console.error(err);
      fs.unlinkSync(filePath);
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to export fruit deliveries' });
  }
};


exports.exportOilProductionToExcel = async (req, res) => {
  try {
    const { start, end } = req.query;
    const params = [];
    const filters = [];

    if (start) {
      params.push(start);
      filters.push(`date >= $${params.length}`);
    }

    if (end) {
      params.push(end);
      filters.push(`date <= $${params.length}`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const query = `
      SELECT id, date, fruit_type, input_quantity, oil_extracted,
             supplied_oil, waste, notes
      FROM oil_extraction_logs
      ${whereClause}
      ORDER BY date DESC
    `;

    const result = await pool.query(query, params);

    const worksheet = XLSX.utils.json_to_sheet(result.rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'OilProduction');

    const filePath = path.join(__dirname, '../exports/oil_production_export.xlsx');
    XLSX.writeFile(workbook, filePath);

    res.download(filePath, 'oil_production_export.xlsx', err => {
      if (err) console.error(err);
      fs.unlinkSync(filePath); // delete after sending
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to export oil production data' });
  }
};


exports.exportFruitDeliveriesToExcel = async (req, res) => {
  try {
    const { start, end } = req.query;
    const params = [];
    const filters = [];

    if (start) {
      params.push(start);
      filters.push(`date >= $${params.length}`);
    }

    if (end) {
      params.push(end);
      filters.push(`date <= $${params.length}`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const query = `
      SELECT id, date, supplier_name, supplier_contact, vehicle_number,
             fruit_type, weight, price_per_kg, total_cost, ticket_number,
             approved_by, notes
      FROM fruit_deliveries
      ${whereClause}
      ORDER BY date DESC
    `;

    const result = await pool.query(query, params);

    const worksheet = XLSX.utils.json_to_sheet(result.rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'FruitDeliveries');

    const filePath = path.join(__dirname, '../exports/fruit_deliveries_export.xlsx');
    XLSX.writeFile(workbook, filePath);

    res.download(filePath, 'fruit_deliveries_export.xlsx', err => {
      if (err) console.error(err);
      fs.unlinkSync(filePath); // clean up after download
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to export fruit deliveries' });
  }
};


exports.exportPettyCashToExcel = async (req, res) => {
  try {
    const { start, end } = req.query;
    const params = [];
    const filters = [];

    if (start) {
      params.push(start);
      filters.push(`date >= $${params.length}`);
    }

    if (end) {
      params.push(end);
      filters.push(`date <= $${params.length}`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const query = `
      SELECT id, date, description, amount, spent_by, category_id, approved_by, notes
      FROM petty_cash
      ${whereClause}
      ORDER BY date DESC
    `;

    const result = await pool.query(query, params);

    const worksheet = XLSX.utils.json_to_sheet(result.rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'PettyCash');

    const filePath = path.join(__dirname, '../exports/petty_cash_export.xlsx');
    XLSX.writeFile(workbook, filePath);

    res.download(filePath, 'petty_cash_export.xlsx', err => {
      if (err) console.error(err);
      fs.unlinkSync(filePath);
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to export petty cash data' });
  }
};


exports.exportMiscExpensesToExcel = async (req, res) => {
  try {
    const { start, end } = req.query;
    const params = [];
    const filters = [];

    if (start) {
      params.push(start);
      filters.push(`date >= $${params.length}`);
    }

    if (end) {
      params.push(end);
      filters.push(`date <= $${params.length}`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const query = `
      SELECT id, date, item_name, purpose, quantity,
             total_cost, approved_by, notes
      FROM misc_expenses
      ${whereClause}
      ORDER BY date DESC
    `;

    const result = await pool.query(query, params);

    const worksheet = XLSX.utils.json_to_sheet(result.rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'MiscExpenses');

    const filePath = path.join(__dirname, '../exports/misc_expenses_export.xlsx');
    XLSX.writeFile(workbook, filePath);

    res.download(filePath, 'misc_expenses_export.xlsx', err => {
      if (err) console.error(err);
      fs.unlinkSync(filePath);
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to export miscellaneous expenses' });
  }
};


const PDFDocument = require('pdfkit');

exports.exportMonthlySummaryToPDF = async (req, res) => {
  try {
    const { start, end } = req.query;
    const params = [];
    const filters = [];

    if (start) {
      params.push(start);
      filters.push(`date >= $${params.length}`);
    }

    if (end) {
      params.push(end);
      filters.push(`date <= $${params.length}`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const pettyCash = await pool.query(`SELECT SUM(amount) AS total FROM petty_cash ${whereClause}`, params);
    const miscExpenses = await pool.query(`SELECT SUM(total_cost) AS total FROM misc_expenses ${whereClause}`, params);
    const fruitCost = await pool.query(`SELECT SUM(total_cost) AS total FROM fruit_deliveries ${whereClause}`, params);
    const staffSalaries = await pool.query(`SELECT SUM(salary_amount) AS total FROM casual_staff_salary ${whereClause}`, params);
    const oilOutput = await pool.query(`SELECT SUM(oil_extracted) AS total FROM oil_extraction_logs ${whereClause}`, params);

    const doc = new PDFDocument();

    // Temp file path
    const filePath = path.join(__dirname, '../exports/summary_report.pdf');
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // PDF Content
    doc.fontSize(20).text('Monthly Summary Report', { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).text(`Date Range: ${start || '---'} to ${end || '---'}`);
    doc.moveDown();

    doc.fontSize(12).text(`🪙 Total Petty Cash: KES ${pettyCash.rows[0].total || 0}`);
    doc.text(`🛠️ Misc Expenses: KES ${miscExpenses.rows[0].total || 0}`);
    doc.text(`🍊 Fruit Deliveries Cost: KES ${fruitCost.rows[0].total || 0}`);
    doc.text(`👷 Staff Salaries: KES ${staffSalaries.rows[0].total || 0}`);
    doc.text(`🛢️ Oil Produced: ${oilOutput.rows[0].total || 0} Liters`);

    doc.end();

    stream.on('finish', () => {
      res.download(filePath, 'monthly_summary.pdf', err => {
        if (err) console.error(err);
        fs.unlinkSync(filePath); // Clean up
      });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate summary PDF' });
  }
};
