export class Signal {
    // Constructor: Initializes the SignalBinding object with listener details
    constructor(signal, listener, isOnce, context, priority = 0) {
        this._signal = signal;   // The signal this binding is connected to
        this._listener = listener; // The function to call when the signal is triggered
        this._isOnce = isOnce;   // Whether the listener should be called only once
        this.context = context;  // The context (or 'this' value) in which the listener is called
        this.priority = priority; // The priority of this listener (higher means it gets called earlier)
        this.active = true;      // Whether this listener is still active
    }

    // Method to execute the listener function when the signal is triggered
    execute(params) {
        if (this.active && this._listener) { // Check if the listener is active
            const args = this.params ? this.params.concat(params) : params; // Combine default params with passed params
            const result = this._listener.apply(this.context, args); // Call the listener in the given context
            if (this._isOnce) { // If the listener should only run once, remove it after calling
                this.detach();
            }
            return result;
        }
    }

    // Method to remove (detach) the listener from the signal
    detach() {
        return this.isBound() ? this._signal.remove(this._listener, this.context) : null; // Remove listener from signal
    }

    // Check if the listener is still connected to the signal
    isBound() {
        return !!this._signal && !!this._listener; // Returns true if signal and listener are both valid
    }

    // Check if the listener should only be triggered once
    isOnce() {
        return this._isOnce; // Returns true if this listener is meant to be called only once
    }

    // Return the listener function
    getListener() {
        return this._listener;
    }

    // Return the signal object this binding is associated with
    getSignal() {
        return this._signal;
    }

    // Internal method to clean up the binding
    _destroy() {
        delete this._signal;
        delete this._listener;
        delete this.context;
    }

    // String representation of the SignalBinding (for debugging)
    toString() {
        return `[SignalBinding isOnce:${this._isOnce}, isBound:${this.isBound()}, active:${this.active}]`;
    }
}
