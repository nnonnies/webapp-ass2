async function fetchConfig() {
    const droneId = 65010874; // ตั้งค่า Drone ID เป็นค่าคงที่
    const allData = []; // สร้างอาร์เรย์เพื่อเก็บข้อมูลทั้งหมด

    try {
        let currentPage = 1; // เริ่มที่หน้าแรก
        let totalPages = 1; // ตัวแปรสำหรับเก็บจำนวนหน้าทั้งหมด

        // ดึงข้อมูลจากทุกหน้า
        do {
            const response = await fetch(`https://script.google.com/macros/s/AKfycbzwclqJRodyVjzYyY-NTQDb9cWG6Hoc5vGAABVtr5-jPA_ET_2IasrAJK4aeo5XoONiaA/exec?page=${currentPage}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log(`API Response for page ${currentPage}:`, data); // ตรวจสอบข้อมูลที่ได้รับจาก API

            // เข้าถึงข้อมูลจาก data แทน items
            if (data.data) {
                if (Array.isArray(data.data) && data.data.length > 0) {
                    allData.push(...data.data); // เพิ่มข้อมูลจาก data
                } else {
                    console.warn(`No items found on page ${currentPage}. Items:`, data.data);
                }
            } else {
                console.warn(`No data found on page ${currentPage}. Data structure:`, data);
            }

            totalPages = data.totalPages || 1; // อัปเดตจำนวนหน้าทั้งหมด (ตั้งค่าเป็น 1 ถ้าไม่มี totalPages)
            currentPage++; // ไปยังหน้าถัดไป
        } while (currentPage <= totalPages); // ดึงข้อมูลจนกว่าจะครบทุกหน้า

        // กรองข้อมูลที่ตรงกับ Drone ID
        const filteredConfig = allData.find(item => item.drone_id === droneId);

        // แสดงข้อมูล
        document.getElementById('drone-id').innerText = droneId;

        if (filteredConfig) {
            console.log('Filtered Config:', filteredConfig); // ตรวจสอบว่าได้ข้อมูลที่ต้องการหรือไม่
            document.getElementById('drone-name').innerText = filteredConfig.drone_name || 'N/A';
            document.getElementById('drone-light').innerText = filteredConfig.light || 'N/A';
            document.getElementById('drone-speed').innerText = filteredConfig.max_speed || 'N/A';
            document.getElementById('drone-country').innerText = filteredConfig.country || 'N/A';
            document.getElementById('drone-population').innerText = filteredConfig.population || 'N/A';
        } else {
            // ถ้าไม่พบข้อมูล
            document.getElementById('drone-name').innerText = 'N/A';
            document.getElementById('drone-light').innerText = 'N/A';
            document.getElementById('drone-speed').innerText = 'N/A';
            document.getElementById('drone-country').innerText = 'N/A';
            document.getElementById('drone-population').innerText = 'N/A';
        }

    } catch (error) {
        console.error('Error fetching config:', error);
    }
}




async function submitTemperature() {
    const temperature = document.getElementById('temperature').value;
    const response = await fetch('https://app-tracking.pockethost.io/api/collections/drone_logs/records', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            created: new Date().toISOString(),
            country: 'japan', // Modify this if needed
            drone_id: '65010874',
            drone_name: 'Manutchai Kongsungnoen', // Modify this if needed
            celsius: temperature
        })
    });
    if (response.ok) {
        alert('Temperature logged successfully!');
        document.getElementById('temperature').value = ''; // Clear input
        fetchLogs(); // Refresh logs after submission
    } else {
        alert('Failed to log temperature.');
    }
}

async function fetchLogs() {
    try {
        const response = await fetch('https://app-tracking.pockethost.io/api/collections/drone_logs/records?filter=(drone_id=65010874)');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json(); // เปลี่ยนชื่อเป็น data เพื่อไม่ให้สับสน
        const logs = data.items; // ดึง logs จาก data.items

        // ตรวจสอบว่าข้อมูลที่ส่งกลับเป็นอาร์เรย์หรือไม่
        if (!Array.isArray(logs)) {
            console.error('Expected logs to be an array:', logs);
            return; // ออกจากฟังก์ชันหากไม่เป็นอาร์เรย์
        }

        const logsBody = document.getElementById('logs-body');
        logsBody.innerHTML = ''; // เคลียร์บันทึกก่อนหน้า
        
        // เรียงลำดับและแสดงบันทึก
        logs.reverse().forEach(log => {
            const row = `<tr>
                <td>${log.created}</td>
                <td>${log.country}</td>
                <td>${log.drone_id}</td>
                <td>${log.drone_name}</td>
                <td>${log.celsius}</td>
            </tr>`;
            logsBody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error fetching logs:', error);
    }
}



function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById(page).style.display = 'block';
}

window.onload = function() {
    fetchConfig();
    fetchLogs();
    showPage('view-config'); // Show the config page by default
};

