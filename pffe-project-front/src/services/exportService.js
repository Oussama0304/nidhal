import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

class ExportService {
  async exportToPdf(data) {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/admin/export/pdf`,
      { data },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        responseType: 'blob',
      }
    );
    return response.data;
  }

  async exportToExcel(data) {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/admin/export/excel`,
      { data },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        responseType: 'blob',
      }
    );
    return response.data;
  }

  // Fonction utilitaire pour déclencher le téléchargement
  downloadFile(blob, fileName) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}

const exportService = new ExportService();
export default exportService;
