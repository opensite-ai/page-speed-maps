// Simple stub for CSS modules in Jest tests
// Returns the class name key so selectors like [class*="vennContainer"] work
const stylesProxy = new Proxy(
	{},
	{
		get: (_target, prop: string) => prop,
	}
);

export default stylesProxy as { [className: string]: string };

