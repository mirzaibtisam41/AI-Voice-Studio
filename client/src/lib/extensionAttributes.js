const EXTENSION_ATTRIBUTES = ['bis_skin_checked', 'bis_register'];

export const REMOVE_EXTENSION_ATTRIBUTES_SCRIPT = `(function(){var names=${JSON.stringify(EXTENSION_ATTRIBUTES)};new MutationObserver(function(mutations){mutations.forEach(function(mutation){var name=mutation.attributeName;if(mutation.target.hasAttribute(name)){mutation.target.removeAttribute(name);}});}).observe(document.documentElement,{attributes:true,subtree:true,attributeFilter:names});})();`;
