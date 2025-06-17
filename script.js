const startButton = document.getElementById('start-button');
const introScreen = document.getElementById('intro-screen');
const testSection = document.getElementById('test-section');
const plates = [
  { src: 'plates/plate1.png', answer: '12', type: 'normal' },
  { src: 'plates/plate2.png', answer: '8', type: 'red-green' },
  { src: 'plates/plate3.png', answer: '6', type: 'red-green' },
  { src: 'plates/plate4.png', answer: '3', type: 'red-green' },
  { src: 'plates/plate5.png', answer: '5', type: 'tritanopia' },
  { src: 'plates/plate6.png', answer: '9', type: 'red-green' },
  { src: 'plates/plate7.png', answer: '45', type: 'red-green' },
  { src: 'plates/plate8.png', answer: '29', type: 'tritanopia' }
];

let currentPlate = 0;
let correctAnswers = 0;
let responses = [];
let redGreenFails = 0;
let tritanopiaFails = 0;
let diagnosis = "";

const testImage = document.getElementById('test-image');
const userInput = document.getElementById('user-input');
const nextButton = document.getElementById('next-button');
const resultSection = document.getElementById('result-section');
const resultText = document.getElementById('result-text');
const downloadBtn = document.getElementById('download-pdf');
const infoPage = document.getElementById('info-page');
const infoText = document.getElementById('info-text');

function speak(text) {
  if ('speechSynthesis' in window) {
    const msg = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(msg);
  }
}

window.onload = () => {
  speak(`Welcome to the ColourScope AI Color Vision Test. What number do you see in the first plate?`);
};

startButton.addEventListener('click', () => {
  introScreen.style.display = 'none';
  testSection.style.display = 'block';
  speak(`What number do you see in the first plate?`);
  userInput.focus();
});

document.addEventListener('keydown', (event) => {
  const activeElement = document.activeElement;
  if (event.key === 'Enter') {
    if (introScreen.style.display !== 'none') {
      startButton.click();
    } else if (
      testSection.style.display !== 'none' &&
      activeElement !== userInput
    ) {
      nextButton.click();
    }
  }
});

nextButton.addEventListener('click', () => {
  const userAnswer = userInput.value.trim();
  if (userAnswer === '') {
    alert('Please enter your answer before continuing.');
    userInput.focus();
    return;
  }

  const plate = plates[currentPlate];
  responses.push({ shown: plate.answer, given: userAnswer, type: plate.type });

  if (userAnswer === plate.answer) {
    correctAnswers++;
  } else {
    if (plate.type === 'red-green') redGreenFails++;
    if (plate.type === 'tritanopia') tritanopiaFails++;
  }

  currentPlate++;

  if (currentPlate < plates.length) {
    testImage.src = plates[currentPlate].src;
    userInput.value = '';
    speak(`Next plate. What number do you see?`);
  } else {
    document.getElementById('test-section').style.display = 'none';
    resultSection.style.display = 'block';

    if (redGreenFails >= 3 && tritanopiaFails < 2) {
      diagnosis = "likely red-green color blindness (Protanopia or Deuteranopia)";
    } else if (tritanopiaFails >= 2) {
      diagnosis = "likely Tritanopia (blue-yellow color blindness)";
    } else if (redGreenFails > 0 || tritanopiaFails > 0) {
      diagnosis = "possible mild color vision deficiency";
    } else {
      diagnosis = "normal color vision";
    }

    resultText.innerHTML = `
      🎉 Test Completed!<br>
      You got <b>${correctAnswers}</b> out of <b>${plates.length}</b> correct.<br><br>
      Your color vision status: <b>${diagnosis}</b>.<br><br>
      Scroll down to learn more and download your report.
    `;

    speak(`Test complete. ${correctAnswers} out of ${plates.length} correct. Diagnosis: ${diagnosis}`);

    infoPage.style.display = 'block';

    if (diagnosis.includes("red-green")) {
      infoText.innerHTML = `
        <b>Red-Green Color Blindness (Protanopia/Deuteranopia)</b><br><br>
        The most common type. It affects the ability to distinguish reds, greens, browns, and purples.<br><br>
        <b>Tips:</b> Use contrast-rich labels, avoid red-green coding, and try vision-enhancing apps.
      `;
    } else if (diagnosis.includes("Tritanopia")) {
      infoText.innerHTML = `
        <b>Tritanopia (Blue-Yellow Color Blindness)</b><br><br>
        A rare form affecting blue and yellow hues. May confuse blues with greens, or yellows with violet.<br><br>
        <b>Tips:</b> Use consistent lighting, and enable assistive screen filters where needed.
      `;
    } else if (diagnosis.includes("mild")) {
      infoText.innerHTML = `
        <b>Mild Color Vision Deficiency</b><br><br>
        May not impair everyday life but can cause subtle challenges with color identification.<br><br>
        <b>Tips:</b> Monitor vision regularly and adapt tools with high contrast or labels.
      `;
    } else {
      infoText.innerHTML = `
        <b>Normal Color Vision</b><br><br>
        No signs of color blindness detected.<br><br>
        <b>Tip:</b> Even with normal vision, periodic eye checks help maintain good eye health.
      `;
    }
  }
});

downloadBtn.addEventListener('click', () => {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert("PDF library not loaded. Please check your internet connection.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFillColor(34, 34, 34);
  doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
  doc.setTextColor(230, 230, 230);

  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.text("ColourScope AI – Test Summary", 20, 30);

  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text(`You scored ${correctAnswers} / ${plates.length}`, 20, 50);
  doc.text(`Diagnosis: ${diagnosis}`, 20, 60);

  doc.setFontSize(14);
  doc.text("Recommendations:", 20, 75);
  let y = 85;

  if (diagnosis === "normal color vision") {
    doc.text("• Maintain regular eye check-ups and rest during screen use.", 20, y); y += 10;
    doc.text("• No additional vision support required.", 20, y);
  } else if (diagnosis.includes("red-green")) {
    doc.text("• Consult a vision specialist if needed.", 20, y); y += 10;
    doc.text("• Try color-enhancing lenses or apps.", 20, y); y += 10;
    doc.text("• Avoid tasks relying solely on red/green cues.", 20, y);
  } else if (diagnosis.includes("Tritanopia")) {
    doc.text("• Use consistent lighting and filters for blue/yellow adjustment.", 20, y); y += 10;
    doc.text("• Seek professional advice for persistent difficulties.", 20, y);
  } else {
    doc.text("• Mild deficiency detected. Monitor and adapt as needed.", 20, y);
  }

  // Detailed Answers
  y += 20;
  doc.setFontSize(14);
  doc.text("Your Plate-by-Plate Answers:", 20, y); y += 10;
  doc.setFontSize(12);

  responses.forEach((r, i) => {
    if (y > 280) {
      doc.addPage(); y = 20;
    }
    doc.text(`Plate ${i + 1} (${r.type}): You said "${r.given}", correct: "${r.shown}"`, 20, y);
    y += 8;
  });

  // Educational Add-On
  y += 15;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("About Colour Blindness", 20, y); y += 8;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  const facts = [
    "• Affects ~1 in 12 men and 1 in 200 women (~300 million people globally).",
    "• Mostly inherited (X-linked), but can also be caused by disease, aging or medications.",
    "• Red–green is the most common form, making reds, greens, and browns hard to distinguish.",
    "• Blue–yellow (Tritanopia) is rare and affects perception of blues and yellows.",
    "• Everyday challenges: food ripeness, traffic lights, graphs, clothing, and exams.",
    "• Colour blindness is often misunderstood and underdiagnosed.",
    "• Simple design changes (like patterns or labels) can improve accessibility."
  ];

  facts.forEach(line => {
    if (y > 280) { doc.addPage(); y = 20; }
    doc.text(line, 20, y); y += 8;
  });

  doc.save("ColourScopeAI_Test_Results.pdf");
});

userInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    nextButton.click();
  }
});
