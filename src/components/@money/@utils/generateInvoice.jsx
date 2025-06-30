import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React from 'react';
import { renderToString } from 'react-dom/server';

import OrderInvoice from '../@order/OrderInvoice';

const generateInvoice = async () => {
  try {
    // Create a container for the invoice
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    // Render the OrderInvoice component to HTML string
    const invoiceHtml = renderToString(<OrderInvoice />);
    container.innerHTML = invoiceHtml;

    // Use html2canvas to capture the rendered component
    const canvas = await html2canvas(container);

    // Create a new jsPDF instance
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');

    // Calculate dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    // Save the PDF
    pdf.save('invoice.pdf');

    // Clean up the temporary container
    document.body.removeChild(container);
  } catch (error) {
    console.error('Error generating invoice:', error);
    alert('An error occurred while generating the invoice. Please try again.');
  }
};

export default generateInvoice;
