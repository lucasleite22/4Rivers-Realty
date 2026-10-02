# Características disponíveis no feed do MLS (MLSGrid / mfrmls)

Levantamento de tudo que a MLSGrid retorna por imóvel, pra avaliar quais
características valem virar filtro na busca pública (`/properties`) além dos
já existentes (Tipo, Condado, Preço, Acres).

Fonte: `services/mlsgrid.service.ts` (interface `MlsListing`), que já tipa os
campos RESO/Stellar realmente usados. O feed bruto tem 190+ campos por
imóvel; abaixo só o que já está tipado (ou seja, confirmado como disponível
na nossa assinatura).

## Já capturado hoje (existe na tabela `properties`)

| Campo MLS | Vira no nosso banco | Uso atual |
|---|---|---|
| `ListPrice` | `priceUsd` | Preço, já filtrável |
| `LotSizeAcres` | `acreage` | Acres, já filtrável |
| `CountyOrParish` | `county` | Condado, já filtrável |
| `City` | `city` | Mostrado na listagem |
| `UnparsedAddress` (ou Street*) | `address` / `title` | Título do card |
| `PropertyType` / `PropertySubType` | `type` (mapeado) | Tipo, já filtrável |
| `StandardStatus` | `status` + `mlsStatus` (bruto) | Badge de status |
| `Latitude` / `Longitude` | `latitude` / `longitude` | Mapa |
| `BedroomsTotal` | `bedrooms` | Mostrado na página de detalhe, **não filtrável ainda** |
| `BathroomsTotalInteger` | `bathrooms` | Mostrado na página de detalhe, **não filtrável ainda** |
| `LivingArea` | `sqft` | Mostrado na página de detalhe, **não filtrável ainda** |
| `YearBuilt` | `yearBuilt` | Mostrado na página de detalhe |
| `PublicRemarks` | `description` | Texto descritivo |
| `ListOfficeName` / `ListAgentFullName` | `mlsListOfficeName` / `mlsListAgentFullName` | Atribuição obrigatória do MLS |
| `Media[]` | `images[]` (re-hospedadas no Blob) | Galeria de fotos |

## Disponível no feed, mas **não usado hoje** — candidatos a filtro

| Campo MLS | O que é | Por que pode virar filtro |
|---|---|---|
| `BedroomsTotal` | Quartos | **Já temos o dado** — só falta a UI de filtro |
| `BathroomsTotalInteger` / `BathroomsFull` / `BathroomsHalf` | Banheiros | **Já temos o dado** — só falta a UI de filtro |
| `LivingArea` | Área construída (sqft) | **Já temos o dado** — filtro de "mín. sqft" |
| `GarageSpaces` | Vagas de garagem | Comum em busca de imóvel residencial |
| `PoolPrivateYN` | Tem piscina privativa | Filtro boolean simples, alta demanda |
| `StoriesTotal` | Nº de andares | Nicho, menor prioridade |
| `HorseYN` / `HorseAmenities[]` | Permite cavalos / lista de instalações equestres (currais, picadeiro, etc.) | **Muito relevante pro nicho da 4Rivers** (fazendas de cavalo) |
| `WaterfrontYN` / `WaterBodyName` | Beira d'água / nome do lago-rio | Valoriza o imóvel, bom filtro boolean |
| `View[]` | Tipo de vista (água, campo, etc.) | Nicho |
| `Zoning` | Zoneamento | Importante pra quem quer construir/expandir |
| `VirtualTourURLUnbranded` | Link de tour virtual | Não é filtro, mas vale exibir na página de detalhe |

## Identificado recentemente (campos extras já tipados no código, uso ainda não decidido)

Esses campos MFR_* (customizados da Stellar MLS) foram adicionados à interface
`MlsListing` numa integração em paralelo (projeto RealRisk, análise de
investimento) — **ainda não estão no nosso schema `Property`**, mas já estão
disponíveis no fetch do MLSGrid caso decidamos usá-los também no portal:

| Campo MLS | O que é | Por que pode interessar |
|---|---|---|
| `DaysOnMarket` / `CumulativeDaysOnMarket` | Dias no mercado | Sinal de "recém-listado" ou "parado" |
| `AssociationFee` / `AssociationFeeFrequency` | Taxa de HOA/condomínio | Filtro relevante pra residencial |
| `WaterSource[]` | Fonte de água (Public, Well, ...) | Importante em área rural |
| `Sewer[]` | Esgoto (Septic Tank, Public Sewer, ...) | Importante em área rural |
| `Utilities[]` | Lista de utilidades disponíveis | Nicho |
| `LotFeatures[]` | Características do lote (Paved, Pasture, In County, ...) | Overlap com o nicho de fazenda/rancho |
| `MFR_FloodZoneCode` | Zona de enchente | Devida diligência do comprador |
| `MFR_MinimumLease` / `MFR_LeaseRestrictionsYN` | Restrição de aluguel do HOA | Nicho |

## Recomendação (pergunta em aberto, não implementado)

Os filtros com **melhor custo-benefício pra implementar primeiro** são
quartos, banheiros e sqft mínimo — o dado já está no banco (`bedrooms`,
`bathrooms`, `sqft`), só falta a UI de filtro em `PropertyFilters` +
`hooks/useProperties.ts`/`/api/properties`. HorseYN/HorseAmenities vêm em
segundo lugar por ser o diferencial da 4Rivers (fazendas de cavalo), mas
exige adicionar essas colunas ao schema primeiro (hoje não são salvas).

Os campos MFR_* (seção acima) exigiriam decidir se fazem sentido pro
*portal público* da 4Rivers ou se ficam só na análise interna do RealRisk —
não foram avaliados pra esse fim ainda.
