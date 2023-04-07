/c
exported_translations={};
exported_translation_request_count=0;
exported_translation_placeholder={};

function mark_for_translation(local_string)
	if type(local_string)~="table" then
		return
	end
	for key,val in pairs(local_string) do
		if key == 1 then
			if string.len(val)>0 and exported_translations[val] == nil then
				exported_translations[val]=exported_translation_placeholder;
				exported_translation_request_count= exported_translation_request_count+1;
				game.player.request_translation({val});
			end
		else
			mark_for_translation(val)
		end
	end
end
script.on_event(defines.events.on_string_translated, function(event)
	exported_translations[event.localised_string[1]]=event.result
	exported_translation_request_count = exported_translation_request_count - 1
	if exported_translation_request_count < 10 then
	    game.print(exported_translation_request_count)
	end
	if exported_translation_request_count == 0 then
		out.translations=exported_translations
		game.write_file("data",game.table_to_json(out))
		game.print("All Done")
	end
end)
out={recipes={},crafters={},technologies={},translations={}};
for key,val in pairs(game.player.force.recipes) do
	mark_for_translation(val.localised_name)
	out.recipes[key]={
	  name=val.name,
	  localised_name=val.localised_name,
	  category=val.category,
	  group=val.group.localised_name,
	  ingredients=val.ingredients,
	  products=val.products,
	  energy = val.energy
	  };
end;
for key,val in pairs(game.get_filtered_entity_prototypes({
	{filter="crafting-machine"},
	{filter="type", type="mining-drill"},
	{filter="type", type="offshore-pump"}})) do
	mark_for_translation(val.localised_name)
	mark_for_translation(val.group.localised_name)
    out.crafters[key]={
		name=val.name,
	    localised_name=val.localised_name, 
		group=val.group.localised_name,
		crafting_categories=val.crafting_categories,
		resource_categories=val.resource_categories, 
		crafting_speed=val.crafting_speed,
		emissions_per_second=val.emissions_per_second,
		energy_usage =val.energy_usage,
		base_productivity = val.base_productivity,
		electric_energy_source_prototype = val.electric_energy_source_prototype,
		fluid= (val.fluid or {name=nil}).name
		};
end;
for key,val in pairs(game.technology_prototypes) do
	local prerequisites={}
	for key,_ in pairs(val.prerequisites) do
		prerequisites[#prerequisites+1]=key;
	end;
	mark_for_translation(val.localised_name)
	out.technologies[key]={
		name = val.name,
		localised_name = val.localised_name,
		localised_description = val.localised_description,
		enabled = val.enabled,
		hidden = val.hidden,
		visible_when_disabled = val.visible_when_disabled,
		ignore_tech_cost_multiplier = val.ignore_tech_cost_multiplier,
		upgrade = val.upgrade,
		prerequisites = prerequisites,
		research_unit_ingredients = val.research_unit_ingredients,
		effects = val.effects,
		research_unit_count = val.research_unit_count,
		research_unit_energy = val.research_unit_energy,
		order = val.order,
		level = val.level,
		max_level = val.max_level,
		research_unit_count_formula = val.research_unit_count_formula
	};
end;
game.print("scraping Done")
game.print(exported_translation_request_count)