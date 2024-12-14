// main.js
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('radicalizationCanvas');
    if (!canvas) {
        console.error('Canvas not found');
        return;
    }

    const ctx = canvas.getContext('2d');
    
    // Stages with actual social media user data (in billions)
    const stages = [
        { 
            label: "2017",
            value: 3.23,
            description: ""
        },
        { 
            label: "2018",
            value: 3.45,
            description: ""
        },
        { 
            label: "2019",
            value: 3.77,
            description: ""
        },
        { 
            label: "2020",
            value: 3.96,
            description: ""
        },
        { 
            label: "2021",
            value: 4.20,
            description: ""
        },
        { 
            label: "2022",
            value: 4.48,
            description: ""
        },
        { 
            label: "2023",
            value: 4.72,
            description: ""
        },
        { 
            label: "2024",
            value: 5.04,
            description: ""
        }
    ];

    const gradientColors = {
        start: '#004080',
        middle: '#376fa7',
        end: '#004c4c'
    };

    const settings = {
        padding: 60,
        barPadding: 40,
        cornerRadius: 8,
        animationDuration: 1000,
        hoverScale: 1.05
    };
    let mouseX = 0;
    let mouseY = 0;
    let hoveredIndex = -1;
    let animationProgress = 0;
    let startTime = null;

    const barWidth = (canvas.width - (settings.padding * 2) - 
                     (settings.barPadding * (stages.length - 1))) / stages.length;

    function createBarGradient(x, y, height) {
        const gradient = ctx.createLinearGradient(x, y, x, y + height);
        gradient.addColorStop(0, gradientColors.start);
        gradient.addColorStop(0.5, gradientColors.middle);
        gradient.addColorStop(1, gradientColors.end);
        return gradient;
    }

    function roundedRect(x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    function drawTooltip(text, x, y) {
        const padding = 10;
        const maxWidth = 200;
                ctx.font = '14px Inter, sans-serif';
        const words = text.split(' ');
        let line = '';
        const lines = [];
        let lineWidth = 0;

        words.forEach(word => {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && line !== '') {
                lines.push(line);
                line = word + ' ';
            } else {
                line = testLine;
            }
        });
        lines.push(line);
        const tooltipHeight = lines.length * 20 + padding * 2;
        const tooltipWidth = maxWidth + padding * 2;
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;
        ctx.fillStyle = 'white';
        roundedRect(x - tooltipWidth/2, y - tooltipHeight - 20, 
                   tooltipWidth, tooltipHeight, 8);
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = '#6B7280';
        lines.forEach((line, i) => {
            ctx.fillText(line, x - tooltipWidth/2 + padding, 
                        y - tooltipHeight - 10 + (i + 1) * 20);
        });
    }

    function drawChart() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fvfvff';
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Global Social Media Users (2017-2024)', canvas.width / 2, 40);
        ctx.strokeStyle = '#6B7280';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = canvas.height - settings.padding - 
                     ((canvas.height - settings.padding * 2) * (i * 20 / 100));
            ctx.beginPath();
            ctx.moveTo(settings.padding, y);
            ctx.lineTo(canvas.width - settings.padding, y);
            ctx.stroke();
        }

        // Draws the bars
        stages.forEach((stage, index) => {
            const x = settings.padding + (barWidth + settings.barPadding) * index;
            const fullHeight = (stage.value / 5.04) * 
                             (canvas.height - settings.padding * 2); // Adjust height relative to max value
            const height = fullHeight * animationProgress;
            const y = canvas.height - settings.padding - height;
            const scale = index === hoveredIndex ? settings.hoverScale : 1;
            const scaledX = x - (barWidth * (scale - 1) / 2);
            const scaledWidth = barWidth * scale;
            ctx.save();
            const gradient = createBarGradient(scaledX, y, height);
            ctx.fillStyle = gradient;
            roundedRect(scaledX, y, scaledWidth, height, settings.cornerRadius);
            ctx.fill();
            ctx.restore();
            ctx.save();
            ctx.translate(x + barWidth / 2, canvas.height - settings.padding + 25);
            ctx.rotate(-Math.PI / 4);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#fffff';
            ctx.font = '14px Inter, sans-serif';
            ctx.fillText(stage.label, 0, 0);
            ctx.restore();
            ctx.font = 'bold 14px Inter, sans-serif';
            ctx.fillStyle = '#30000';
            ctx.textAlign = 'center';
            ctx.fillText(stage.value + 'B', x + barWidth / 2, y - 10);
            if (index === hoveredIndex) {
                drawTooltip(stage.description, x + barWidth / 2, y - 20);
            }
        });

        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const value = i * 1; 
            const y = canvas.height - settings.padding - 
                     ((canvas.height - settings.padding * 2) * (value / 5.04));
            ctx.fillText(value + 'B', settings.padding - 10, y + 4);
        }
    }

    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = (timestamp - startTime) / settings.animationDuration;
        animationProgress = Math.min(progress, 1);
        
        drawChart();

        if (animationProgress < 1) {
            requestAnimationFrame(animate);
        }
    }

    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = event.clientX - rect.left;
        mouseY = event.clientY - rect.top;

        stages.forEach((stage, index) => {
            const x = settings.padding + (barWidth + settings.barPadding) * index;
            const height = (stage.value / 5.04) * (canvas.height - settings.padding * 2);
            const y = canvas.height - settings.padding - height;

            if (mouseX >= x && mouseX <= x + barWidth &&
                mouseY >= y && mouseY <= canvas.height - settings.padding) {
                hoveredIndex = index;
                canvas.style.cursor = 'pointer';
                drawChart();
                return;
            }
        });

        if (mouseX < settings.padding || mouseX > canvas.width - settings.padding ||
            mouseY < settings.padding || mouseY > canvas.height - settings.padding) {
            hoveredIndex = -1;
            canvas.style.cursor = 'default';
            drawChart();
        }
    });

    window.addEventListener('resize', () => {
        drawChart();
    });

    requestAnimationFrame(animate);
});
