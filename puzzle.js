(() => {
    const canvas = document.getElementById('puzzle');
    const context = canvas.getContext('2d');

    const image = new Image();
    const image2 = new Image();
    const [dimensions, ...imageUrls] = atob(location.search.replace(/^\?/, '')).split('~');
    image.src = imageUrls[0];
    image2.src = imageUrls[1];

    const [dimensionX, dimensionY] = dimensions.split('x').map(d => parseInt(d));

    let board;
    let panels;
    let order;

    const initMatrix = (PanelWidth, PanelHeight, border = 0.03) => {
        const panels = [];
        for (let y = 0; y < dimensionY; y++) {
            for (let x = 0; x < dimensionX; x++) {
                panels.push({
                    x: x * PanelWidth + PanelWidth * border / 2,
                    y: y * PanelHeight + PanelHeight * border / 2,
                    width: PanelWidth - PanelWidth * border,
                    height: PanelHeight- PanelHeight * border,
                    blank: (x == dimensionX - 1 && y == dimensionY - 1),
                });
            }
        }
        return panels;
    }

    const shuffle = (arr) => {
        const blank = arr.findIndex(val => val == arr.length - 1);

        let directions = [];
        if (blank % dimensionX > 0) directions.push(blank - 1);
        if (blank % dimensionX < dimensionX - 1) directions.push(blank + 1);
        if (blank - dimensionX >= 0) directions.push(blank - dimensionX);
        if (blank + dimensionX < arr.length) directions.push(blank + dimensionX);

        const destination = directions[Math.floor(Math.random() * directions.length)];
        [arr[blank], arr[destination]] = [arr[destination], arr[blank]];
        return arr;
    }

    const render = () => {
        context.fillRect(0, 0, canvas.width, canvas.height);
        board.forEach((cell, i) => {
            const panel = panels[order[i]];
            if (!panel.blank)
                context.drawImage(
                    image,
                    panel.x, panel.y, panel.width, panel.height,
                    cell.x, cell.y, cell.width, cell.height,
                );
        });
    }

    const renderComplete = () => {
        context.drawImage(
            image,
            0, 0, image.width, image.height,
            0, 0, canvas.width, canvas.height,
        );
        if (image2.width) {
            setTimeout(() => {fadein(100);}, 3000);
        }
    }

    const fadein = (repeat, current = 0) => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.save();
        context.globalAlpha = 1 - (current / repeat);
        context.drawImage(
            image,
            0, 0, image.width, image.height,
            0, 0, canvas.width, canvas.height,
        );
        context.globalAlpha = current / repeat;
        context.drawImage(
            image2,
            0, 0, image.width, image.height,
            0, 0, canvas.width, canvas.height,
        );
        context.restore();
        if (current < repeat) setTimeout(() => {fadein(repeat, current + 1);}, 1000 / 60);
    }

    const movePanel  = (e) => {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left - (canvas.offsetWidth - canvas.width) / 2;
        const y = e.clientY - rect.top - (canvas.offsetWidth - canvas.width) / 2;
        const cellIndex = board.findIndex(cell => 
            cell.x <= x && cell.x + cell.width > x &&
            cell.y <= y && cell.y + cell.height > y 
        );

        if (cellIndex !== -1) {
            const blankCellIndex = order.findIndex((val, i) => {
                return panels[val].blank &&
                (
                    i === cellIndex - 1 ||
                    i === cellIndex + 1 ||
                    i === cellIndex - dimensionX ||
                    i === cellIndex + dimensionX
                )}
            );
            if (blankCellIndex !== -1) {
                [order[cellIndex], order[blankCellIndex]] = [order[blankCellIndex], order[cellIndex]];
                if (JSON.stringify(order) == JSON.stringify(Array.from(panels.keys()))) {
                    panels[panels.length - 1].blank = false; // the last panel
                    renderComplete();
                }
                else {
                    render();
                }
            }
        }
    }

    const showShuffle = (repeat) => {
        order = shuffle(order);
        render();
        if (repeat > 0) setTimeout(() => {showShuffle(repeat - 1);}, 0);
        else canvas.onclick = movePanel;
    }

    image.onload = () => {
        canvas.height = canvas.width * image.height / image.width;
        board = initMatrix(canvas.width / dimensionX, canvas.height / dimensionY);
        panels = initMatrix(image.width / dimensionX, image.height / dimensionY);
        order = Array.from(panels.keys());
        requestAnimationFrame(render);
        setTimeout(() => {showShuffle(dimensionX * dimensionY * 8);}, 1000);
    }
})();
