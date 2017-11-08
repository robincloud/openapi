if (!Object.values) {
	Object.values = (obj) => {
		const props = Object.keys(obj);
		const result = new Array(props.length);

		for (let i = 0; i < props.length; ++i) {
			result[i] = obj[props[i]];
		}

		return result;
	};
}

if (!Object.entries) {
	Object.entries = (obj) => {
		const props = Object.keys(obj);
		const result = new Array(props.length);

		for (let i = 0; i < props.length; ++i) {
			const prop = props[i];
			result[i] = [prop, obj[prop]];
		}

		return result;
	};
}
