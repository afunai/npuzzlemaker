(() => {
    const size = 4;

    const canvas = document.getElementById('puzzle');
    const context = canvas.getContext('2d');
    const image = document.getElementById('source');

    let board;
    let panels;
    let order;

    const initMatrix = (PanelWidth, PanelHeight, border = 0.03) => {
        const panels = [];
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                panels.push({
                    x: x * PanelWidth + PanelWidth * border / 2,
                    y: y * PanelHeight + PanelHeight * border / 2,
                    width: PanelWidth - PanelWidth * border,
                    height: PanelHeight- PanelHeight * border,
                    blank: (x == size - 1 && y == size - 1),
                });
            }
        }
        return panels;
    }

    const shuffle = (arr) => {
        const blank = arr.findIndex(val => val == arr.length - 1);

        let directions = [];
        if (blank % size > 0) directions.push(blank - 1);
        if (blank % size < size - 1) directions.push(blank + 1);
        if (blank - size >= 0) directions.push(blank - size);
        if (blank + size < arr.length) directions.push(blank + size);

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
                    i === cellIndex - size ||
                    i === cellIndex + size
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
        board = initMatrix(canvas.width / size, canvas.height / size);
        panels = initMatrix(image.width / size, image.height / size);
        order = Array.from(panels.keys());
        requestAnimationFrame(render);
        setTimeout(() => {showShuffle(size * size * 8);}, 1000);
    }
})();
