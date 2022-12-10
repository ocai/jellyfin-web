/**
 * Module for performing keyboard navigation.
 * @module components/input/keyboardnavigation
 */

import inputManager from './inputManager';
import layoutManager from '../components/layoutManager';
import appSettings from './settings/appSettings';

/**
 * Key name mapping.
 */
const KeyNames = {
    13: 'Enter',
    19: 'Pause',
    27: 'Escape',
    32: 'Space',
    37: 'ArrowLeft',
    38: 'ArrowUp',
    39: 'ArrowRight',
    40: 'ArrowDown',
    // MediaRewind (Tizen/WebOS)
    412: 'MediaRewind',
    // MediaStop (Tizen/WebOS)
    413: 'MediaStop',
    // MediaPlay (Tizen/WebOS)
    415: 'MediaPlay',
    // MediaFastForward (Tizen/WebOS)
    417: 'MediaFastForward',
    // Back (WebOS)
    461: 'Back',
    // Back (Tizen)
    10009: 'Back',
    // MediaTrackPrevious (Tizen)
    10232: 'MediaTrackPrevious',
    // MediaTrackNext (Tizen)
    10233: 'MediaTrackNext',
    // MediaPlayPause (Tizen)
    10252: 'MediaPlayPause'
};

/**
 * Keys used for keyboard navigation.
 */
const NavigationKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];

/**
 * Elements for which navigation should be constrained.
 */
const InteractiveElements = ['INPUT', 'TEXTAREA'];

let hasFieldKey = false;
try {
    hasFieldKey = 'key' in new KeyboardEvent('keydown');
} catch (e) {
    console.error("error checking 'key' field");
}

if (!hasFieldKey) {
    // Add [a..z]
    for (let i = 65; i <= 90; i++) {
        KeyNames[i] = String.fromCharCode(i).toLowerCase();
    }
}

/**
 * Returns key name from event.
 *
 * @param {KeyboardEvent} event - Keyboard event.
 * @return {string} Key name.
 */
export function getKeyName(event) {
    return KeyNames[event.keyCode] || event.key;
}

/**
 * Returns _true_ if key is used for navigation.
 *
 * @param {string} key - Key name.
 * @return {boolean} _true_ if key is used for navigation.
 */
export function isNavigationKey(key) {
    return NavigationKeys.indexOf(key) != -1;
}

export function enable() {
    window.addEventListener('keydown', function (e) {
        const key = getKeyName(e);

        // Ignore navigation keys for non-TV
        if (!layoutManager.tv && isNavigationKey(key)) {
            return;
        }

        let capture = true;

        switch (key) {
            case 'ArrowLeft':
                if (!InteractiveElements.includes(document.activeElement?.tagName)) {
                    inputManager.handleCommand('left');
                } else {
                    capture = false;
                }
                break;
            case 'ArrowUp':
                inputManager.handleCommand('up');
                break;
            case 'ArrowRight':
                if (!InteractiveElements.includes(document.activeElement?.tagName)) {
                    inputManager.handleCommand('right');
                } else {
                    capture = false;
                }
                break;
            case 'ArrowDown':
                inputManager.handleCommand('down');
                break;

            case 'Back':
                inputManager.handleCommand('back');
                break;

            case 'Escape':
                if (layoutManager.tv) {
                    inputManager.handleCommand('back');
                } else {
                    capture = false;
                }
                break;

            case 'MediaPlay':
                inputManager.handleCommand('play');
                break;
            case 'Pause':
                inputManager.handleCommand('pause');
                break;
            case 'MediaPlayPause':
                inputManager.handleCommand('playpause');
                break;
            case 'MediaRewind':
                inputManager.handleCommand('rewind');
                break;
            case 'MediaFastForward':
                inputManager.handleCommand('fastforward');
                break;
            case 'MediaStop':
                inputManager.handleCommand('stop');
                break;
            case 'MediaTrackPrevious':
                inputManager.handleCommand('previoustrack');
                break;
            case 'MediaTrackNext':
                inputManager.handleCommand('nexttrack');
                break;

            default:
                capture = false;
        }

        if (capture) {
            console.debug('disabling default event handling');
            e.preventDefault();
        }
    });
}

// Gamepad initialisation. No script is required if no gamepads are present at init time, saving a bit of resources.
// Whenever the gamepad is connected, we hand all the control of the gamepad to gamepadtokey.js by removing the event handler
function attachGamepadScript() {
    console.log('Gamepad connected! Attaching gamepadtokey.js script');
    window.removeEventListener('gamepadconnected', attachGamepadScript);
    /* eslint-disable-next-line  @babel/no-unused-expressions */
    import('./gamepadtokey');
}

// No need to check for gamepads manually at load time, the eventhandler will be fired for that
if (navigator.getGamepads && appSettings.enableGamepad()) { /* eslint-disable-line compat/compat */
    window.addEventListener('gamepadconnected', attachGamepadScript);
}

export default {
    enable: enable,
    getKeyName: getKeyName,
    isNavigationKey: isNavigationKey
};
