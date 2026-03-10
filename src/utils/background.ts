type BackgroundScheduler = (promise: Promise<unknown>) => void;

let scheduler: BackgroundScheduler = (promise) => {
	void promise.catch((error) => {
		console.error("Background task failed:", error);
	});
};

export function setBackgroundScheduler(nextScheduler: BackgroundScheduler) {
	scheduler = (promise) => {
		nextScheduler(
			promise.catch((error) => {
				console.error("Background task failed:", error);
			}),
		);
	};
}

export function runInBackground(task: Promise<unknown> | (() => Promise<unknown>)) {
	const promise = typeof task === "function" ? task() : task;
	scheduler(promise);
}
