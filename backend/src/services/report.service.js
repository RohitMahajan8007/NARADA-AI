import puppeteer from 'puppeteer';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Monitor from '../models/monitor.model.js';
import Log from '../models/log.model.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const generateWeeklyReport = async (user) => {
  let browser = null;
  try {
    const monitors = await Monitor.find({ user: user._id });
    if (!monitors.length) return null;

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const reportData = await Promise.all(monitors.map(async (m) => {
      const logs = await Log.find({
        monitor: m._id,
        createdAt: { $gte: lastWeek }
      });

      const totalLogs = logs.length;
      const upLogs = logs.filter(l => (l.status||'').toLowerCase() === 'up').length;
      const uptime = totalLogs > 0 ? ((upLogs / totalLogs) * 100).toFixed(1) : 100;
      
      const avgResp = totalLogs > 0 
        ? Math.round(logs.reduce((acc, curr) => acc + (curr.responseTime || 0), 0) / totalLogs)
        : 0;

      return {
        name: m.name,
        url: m.url,
        uptime,
        avgResp,
        status: m.status
      };
    }));

    const html = await ejs.render(`
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', sans-serif; color: #1E293B; padding: 40px; margin: 0; }
            .header { border-bottom: 2px solid #6366F1; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 24px; font-weight: 800; color: #6366F1; }
            .report-info { text-align: right; font-size: 12px; color: #64748B; }
            .summary-card { background: #F8FAFC; border-radius: 12px; padding: 20px; margin-bottom: 30px; border: 1px solid #E2E8F0; }
            .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .table th { text-align: left; background: #F1F5F9; padding: 12px; font-size: 11px; text-transform: uppercase; color: #64748B; letter-spacing: 0.05em; }
            .table td { padding: 14px 12px; border-bottom: 1px solid #F1F5F9; font-size: 13px; }
            .badge { padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; }
            .badge-up { background: #DCFCE7; color: #166534; }
            .badge-down { background: #FEE2E2; color: #991B1B; }
            .footer { margin-top: 50px; text-align: center; color: #94A3B8; font-size: 11px; border-top: 1px solid #F1F5F9; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">NARADA AI</div>
            <div class="report-info">
              <div>WEEKLY PERFORMANCE REPORT</div>
              <div><%= dateRange %></div>
            </div>
          </div>

          <div class="summary-card">
             <h2 style="margin: 0 0 10px 0; font-size: 18px;">Account Overview</h2>
             <p style="margin: 0; font-size: 14px; color: #475569;">Report for <strong><%= user.fullname %></strong> (<%= user.email %>)</p>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Monitor</th>
                <th>Status</th>
                <th>Uptime (7d)</th>
                <th>Avg. Resp</th>
                <th>Site URL</th>
              </tr>
            </thead>
            <tbody>
              <% reports.forEach(r => { %>
                <tr>
                  <td><strong><%= r.name %></strong></td>
                  <td><span class="badge <%= r.status === 'up' ? 'badge-up' : 'badge-down' %>"><%= r.status.toUpperCase() %></span></td>
                  <td style="color: <%= r.uptime > 99 ? '#10B981' : '#F59E0B' %>; font-weight: 700;"><%= r.uptime %>%</td>
                  <td><%= r.avgResp %>ms</td>
                  <td style="color: #64748B; font-size: 11px;"><%= r.url %></td>
                </tr>
              <% }) %>
            </tbody>
          </table>

          <div class="footer">
            Generated on <%= new Date().toLocaleString() %> by Narada AI Monitoring System.
          </div>
        </body>
      </html>
    `, { 
      user, 
      reports: reportData,
      dateRange: `${lastWeek.toLocaleDateString()} - ${new Date().toLocaleDateString()}`
    });

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    
    return pdfBuffer;
  } catch (error) {
    console.error("REPORT_GEN_ERROR:", error);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
};
