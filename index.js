const makePuzzle = () => {
    location.href = './puzzle.html?' + btoa(
        document.getElementById('dimensions').value +
        '~' +
        document.getElementById('imageUrl1').value +
        '~' +
        document.getElementById('imageUrl2').value
    );
    return false;
};