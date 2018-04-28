if OBJECT_ID('GenerateOneAttrData') is not null begin 
	drop procedure GenerateOneAttrData;
end;

go 

create procedure GenerateOneAttrData
	@attr nvarchar(500),
	@parentAttr nvarchar(500) null = null,
	@egoNode int,
	@attrValuesPerNode int = 1,
	@maxAttrValues int = 5 -- Maximum number of attribute values used for generating data
as begin 

	declare @nodeCount int;
	select @nodeCount = count(*) from Nodes where Ego_Node_ID = @egoNode;


	with
		n as (
			select top (
				case 
					when @parentAttr is null then cast(@nodeCount * (0.3 + rand() * 0.4) as int)
					else @nodeCount
				end)
				* 
			from 
				Nodes as n1
			where 
				n1.Ego_Node_ID = @egoNode and
				(@parentAttr is null or		
				 exists (
					select	
						1
					from
						Node_Attr as na1 inner join
						Attributes as a1 on na1.Attr_ID = a1.ID
					where
						a1.Attr_Type = @parentAttr and
						na1.Node_ID = n1.Node_ID
				 ))
			order by newid()
		),			 
		few_attr as (
			select top (@maxAttrValues)
				*
			from
				Attributes as a 
			where
				a.Attr_Type = @attr
			order by 
				a.ID
		),
		nodes_with_attr as (
			select 				
				*
			from
				(select * from  n) as n1 outer apply
				(select top(1 + cast(@attrValuesPerNode * RAND(n1.Node_ID * 100000) as int))
					*
				 from
					few_attr
				 where
					n1.Node_ID <> few_attr.ID
				 order by
					newid()) as attr
		)		
	insert into Node_Attr (Node_ID, Ego_Node_ID, Attr_ID)
	select
		src.Node_ID,
		src.Ego_Node_ID,
		src.ID
	from
		nodes_with_attr as src;

end;

go	

begin transaction

declare @egoNodes int = 3980;

delete from Node_Attr
where
  Ego_Node_ID = @egoNodes;

exec GenerateOneAttrData 
	@attr = 'education;type;anonymized',
	@egoNode = @egoNodes;

exec GenerateOneAttrData 
	@attr = 'education;degree;id;anonymized',
	@parentAttr = 'education;type;anonymized',
	@egoNode = @egoNodes,
	@attrValuesPerNode = 3;

exec GenerateOneAttrData 
	@attr = 'work;location;id;anonymized',
	@egoNode = @egoNodes;

exec GenerateOneAttrData 
	@attr = 'work;position;id;anonymized',
	@parentAttr = 'work;location;id;anonymized',
	@egoNode = @egoNodes;

exec GenerateOneAttrData 
	@attr = 'languages;id;anonymized',
	@egoNode = @egoNodes;

exec GenerateOneAttrData 
	@attr = 'locale;anonymized',
	@parentAttr = 'languages;id;anonymized',
	@egoNode = @egoNodes;


exec GenerateOneAttrData 
	@attr = 'location;id;anonymized',
	@egoNode = @egoNodes;

exec GenerateOneAttrData 
	@attr = 'hometown;id;anonymized',
	@parentAttr = 'location;id;anonymized',
	@egoNode = @egoNodes;

select
  *
from
  Node_Attr na inner join
  Attributes a on na.Attr_ID = a.ID
where
  na.Ego_Node_ID = @egoNodes 
  and a.Attr_Type = 'education;degree;id;anonymized'
order by
  na.Node_ID, a.Attr_Name


commit