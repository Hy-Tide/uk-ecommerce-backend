const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit-table');

/**
 * Handles exporting data into JSON, CSV, Excel, or PDF.
 * @param {Object} res - Express response object
 * @param {String} format - 'json', 'csv', 'excel', or 'pdf'
 * @param {String} filename - Base name of the file
 * @param {Array} columns - Array of objects { header: 'Name', key: 'name', width: 20 }
 * @param {Array} data - Array of data objects matching the column keys
 */
const exportReport = async (res, format, filename, columns, data) => {
    try {
        if (!format || format === 'json') {
            return res.status(200).json({ success: true, count: data.length, data });
        }

        const dateStr = new Date().toISOString().split('T')[0];
        const finalFilename = `${filename}_${dateStr}`;

        if (format === 'csv' || format === 'excel') {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(filename);

            worksheet.columns = columns;

            // Add rows
            data.forEach((row) => {
                worksheet.addRow(row);
            });

            // Style headers
            worksheet.getRow(1).font = { bold: true };

            if (format === 'csv') {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename="${finalFilename}.csv"`);
                await workbook.csv.write(res);
            } else {
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', `attachment; filename="${finalFilename}.xlsx"`);
                await workbook.xlsx.write(res);
            }
            return res.end();
        }

        if (format === 'pdf') {
            const doc = new PDFDocument({ margin: 30, size: 'A4' });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${finalFilename}.pdf"`);
            
            doc.pipe(res);

            doc.fontSize(16).text(`${filename} Report`, { align: 'center' });
            doc.moveDown();
            doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });
            doc.moveDown(2);

            const table = {
                title: filename,
                headers: columns.map(col => ({ label: col.header, property: col.key, width: col.width ? col.width * 5 : undefined })),
                datas: data.map(row => {
                    const rowData = {};
                    columns.forEach(col => {
                        // Coerce to string for pdfkit-table
                        rowData[col.key] = row[col.key] !== null && row[col.key] !== undefined ? String(row[col.key]) : '';
                    });
                    return rowData;
                }),
            };

            await doc.table(table, {
                prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
                prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                    doc.font("Helvetica").fontSize(8);
                },
            });

            doc.end();
        }
    } catch (error) {
        console.error('Export Error:', error);
        res.status(500).json({ success: false, message: 'Failed to export report' });
    }
};

module.exports = {
    exportReport
};
