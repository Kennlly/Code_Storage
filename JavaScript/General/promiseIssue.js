/*
When we have a few async/await functions, but they are not dependent, we should NOT use await, await, and await, 
instead, we just call all the promises and save them into a promising variable, then await all the variables at the same time.
*/

//Bad code: but this is not returning promise, just provides idea
const badIntegrateStatisticsFlow = async () => {
	try {
		const postAgentStatResult = await agentStatFlow();
		const postAgentQueueStatResult = await agentQueueStatFlow();
		const postQueueStatResult = await queueStatFlow();
		return postAgentStatResult && postAgentQueueStatResult && postQueueStatResult;
	} catch (err) {
		generalLogger.error(`integrateStatisticsFlow Func ${err}`);
		return false;
	}
};

//Good code
const goodIntegrateStatisticsFlow = async () => {
	try {
		const postAgentStatResultPromise = agentStatFlow();
		const postAgentQueueStatResultPromise = agentQueueStatFlow();
		const postQueueStatResultPromise = queueStatFlow();

		const [postAgentStatResult, postAgentQueueStatResult, postQueueStatResult] = await Promise.all([
			postAgentStatResultPromise,
			postAgentQueueStatResultPromise,
			postQueueStatResultPromise,
		]);

		return postAgentStatResult && postAgentQueueStatResult && postQueueStatResult;
	} catch (err) {
		generalLogger.error(`integrateStatisticsFlow Func ${err}`);
		return false;
	}
};
