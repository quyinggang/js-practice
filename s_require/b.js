define(['require'], function(require) {
	require(['a'], function(a) {
		console.log(a);
	});
	return 'world';
});