var powerUps = [
    {
        duration: 10000
    },
    {
        duration: 5000,
        speedMultiplier: 2,
        label: 'Double Speed!'
    },
    {
        duration: 5000,
        speedMultiplier: 3,
        label: 'Triple Speed!'
    },
    {
        duration: 8000,
        label: 'Speed normal'
    },
    {
        duration: 5000,
        speedMultiplier: .5,
        label: 'Sloooow'
    },
    {
        duration: 8000,
        speedMultiplier: 1,
        label: 'And back to normal again'
    },
    {
        duration: 5000,
        speedWobble: 2,
        label: 'Wobbling'
    },
    {
        duration: 5000,
        speedWobble: 0,
        label: 'Wobble off'
    }
];
var currentPowerUpIndex = 0;

var speedMultiplier = 1;
var speedWobble = 0;

function setupNextPowerUp() {
    setTimeout(function() {
        currentPowerUpIndex++;
        if (currentPowerUpIndex >= powerUps.length) {
            currentPowerUpIndex = 0;
        }

        console.log(powerUps[currentPowerUpIndex].label || '');

        speedMultiplier = powerUps[currentPowerUpIndex].speedMultiplier || 1;
        speedWobble = powerUps[currentPowerUpIndex].speedWobble || 0;

        setupNextPowerUp();
    }, powerUps[currentPowerUpIndex].duration);
}
setupNextPowerUp();
