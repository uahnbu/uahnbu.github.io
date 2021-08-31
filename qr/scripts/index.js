var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const image = document.querySelector('#image-box img');
const video = document.querySelector('#image-box video');
const controls = document.querySelector('#image-controls-box');
const resultBox = document.querySelector('#result-box');
let stream;
function triggerImageInput(event) {
    if (event.code && event.code !== 'Enter' && event.code !== 'Space')
        return;
    if (stream) {
        video.classList.toggle('mirror');
        return;
    }
    controls.querySelector('input').click();
}
function switchToDevice({ code }) {
    if (code !== 'Enter' && code !== 'Space')
        return;
    document.querySelector('#controls-device').checked = true;
    disableCamera(true, true);
}
function switchToCamera({ code }) {
    if (code !== 'Enter' && code !== 'Space')
        return;
    document.querySelector('#controls-camera').checked = true;
    enableCamera();
}
function copyResult() {
    const text = resultBox.textContent;
    if (!text)
        return;
    navigator.clipboard.writeText(text);
    const copyText = document.querySelector('#copy-text');
    const copyArea = document.querySelector('#copy-area');
    copyText.textContent = 'Copied!';
    copyArea.classList.add('copied');
    setTimeout(() => {
        copyText.textContent = 'Copy';
        copyArea.classList.remove('copied');
    }, 2000);
}
function handleImageInput({ target }) {
    handleDataTransfer(target);
}
function handleFileDrop(event) {
    document.body.classList.remove('dragover');
    handleDataTransfer(event.dataTransfer);
    event.preventDefault();
}
document.addEventListener('paste', event => {
    handleDataTransfer(event.clipboardData);
});
function handleDataTransfer(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const file = data.files[0];
        if (!file)
            return;
        if (!(yield readImage(file)))
            return;
        QrScanner.scanImage(image)
            .then(result => showResult(result))
            .catch(() => readQRCode());
    });
}
function readImage(file) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!file.type.startsWith('image/')) {
            showError('File is not an Image');
            return false;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        yield new Promise(resolve => reader.onloadend = resolve);
        resultBox.scrollIntoView();
        image.src = reader.result;
        image.hidden = false;
        controls.hidden = true;
        return true;
    });
}
function readQRCode() {
    QCodeDecoder().decodeFromImage(image, (err, result) => {
        err ? showError('No QR Code found') : showResult(result);
    });
}
function disableCamera(willDetachVideo, willHideVideo) {
    var _a;
    stream === null || stream === void 0 ? void 0 : stream.stop();
    stream = null;
    if (willDetachVideo) {
        (_a = video.srcObject) === null || _a === void 0 ? void 0 : _a.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    if (willHideVideo) {
        document.body.classList.remove('camera');
        video.hidden = true;
        controls.hidden = false;
    }
}
function enableCamera() {
    return __awaiter(this, void 0, void 0, function* () {
        disableCamera(true);
        document.body.classList.add('camera');
        image.hidden = controls.hidden = true;
        video.hidden = false;
        video.scrollIntoView(false);
        stream = new QrScanner(video, res => showResult(res), err => showError(err));
        stream.pause = function (stopStreamImmediately) {
            return __awaiter(this, void 0, void 0, function* () {
                this._paused = true;
                if (!this._active)
                    return true;
                this.$video.pause();
                const stopStream = () => {
                    var _a;
                    (_a = this.$video.srcObject) === null || _a === void 0 ? void 0 : _a.getTracks().forEach(track => {
                        track.stop();
                    });
                };
                if (stopStreamImmediately) {
                    stopStream();
                    return true;
                }
                yield new Promise((resolve) => setTimeout(resolve, 300));
                if (!this._paused)
                    return false;
                stopStream();
                return true;
            });
        };
        stream.start().catch(err => showError(err));
    });
}
function showResult(result) {
    if (/^https?:\/\//.test(result)) {
        const url = `<a href=${result} target="_blank">${result}</a>`;
        const fixedUrl = `<div contenteditable="false">${url}</div>`;
        resultBox.innerHTML = fixedUrl;
    }
    else
        resultBox.textContent = result;
    stream && (resultBox.scrollIntoView(), disableCamera());
}
function showError(err) {
    const redError = `<span class="error">${Error(err)}</span>`;
    const fixedError = `<div contenteditable=false>${redError}</div>`;
    resultBox.innerHTML = fixedError;
}
function enableCameraByDefault() {
    return __awaiter(this, void 0, void 0, function* () {
        const devices = yield navigator.mediaDevices.enumerateDevices();
        const hasEnvironmenMode = devices.some(device => {
            if (device.kind !== 'videoinput')
                return;
            const videoDevice = device;
            if (!('getCapabilities' in videoDevice))
                return;
            const facingModes = videoDevice.getCapabilities().facingMode;
            return facingModes.includes('environment');
        });
        hasEnvironmenMode && enableCamera();
    });
}
