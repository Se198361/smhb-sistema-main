-- Funções do Supabase para substituir o backend Express

-- Função para registrar usuário
CREATE OR REPLACE FUNCTION register_user(nome TEXT, email TEXT, password TEXT)
RETURNS JSON AS $$
DECLARE
  user_id INTEGER;
  hashed_password TEXT;
  result JSON;
BEGIN
  -- Verificar se o email já existe
  IF EXISTS (SELECT 1 FROM "Usuario" WHERE "email" = register_user.email) THEN
    RAISE EXCEPTION 'Email já cadastrado';
  END IF;
  
  -- Hash da senha (em produção, usar uma função mais segura)
  hashed_password := crypt(password, gen_salt('bf'));
  
  -- Inserir usuário
  INSERT INTO "Usuario" ("nome", "email", "senhaHash")
  VALUES (nome, email, hashed_password)
  RETURNING "id" INTO user_id;
  
  -- Retornar dados do usuário
  SELECT json_build_object(
    'user', json_build_object(
      'id', user_id,
      'email', email,
      'nome', nome
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Função para login de usuário
CREATE OR REPLACE FUNCTION login_user(email TEXT, password TEXT)
RETURNS JSON AS $$
DECLARE
  user_record RECORD;
  is_valid BOOLEAN;
  result JSON;
BEGIN
  -- Buscar usuário
  SELECT * INTO user_record FROM "Usuario" WHERE "email" = login_user.email;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Email ou senha inválidos';
  END IF;
  
  -- Verificar senha
  is_valid := user_record."senhaHash" = crypt(password, user_record."senhaHash");
  
  IF NOT is_valid THEN
    RAISE EXCEPTION 'Email ou senha inválidos';
  END IF;
  
  -- Retornar dados do usuário
  SELECT json_build_object(
    'user', json_build_object(
      'id', user_record."id",
      'email', user_record."email",
      'nome', user_record."nome"
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Função para buscar usuário por ID
CREATE OR REPLACE FUNCTION get_user_by_id(user_id INTEGER)
RETURNS JSON AS $$
DECLARE
  user_record RECORD;
  result JSON;
BEGIN
  -- Buscar usuário
  SELECT * INTO user_record FROM "Usuario" WHERE "id" = user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;
  
  -- Retornar dados do usuário
  SELECT json_build_object(
    'user', json_build_object(
      'id', user_record."id",
      'email', user_record."email",
      'nome', user_record."nome"
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Função para buscar avisos com paginação
CREATE OR REPLACE FUNCTION get_avisos(page_number INTEGER DEFAULT 1, page_size INTEGER DEFAULT 10, search_query TEXT DEFAULT '')
RETURNS JSON AS $$
DECLARE
  avisos_data JSON;
  total_count INTEGER;
  has_more BOOLEAN;
BEGIN
  -- Buscar avisos com paginação e busca
  SELECT json_agg(row_to_json(t)) INTO avisos_data
  FROM (
    SELECT * FROM "Aviso"
    WHERE 
      (search_query = '' OR 
       "titulo" ILIKE '%' || search_query || '%' OR 
       "conteudo" ILIKE '%' || search_query || '%' OR 
       "descricao" ILIKE '%' || search_query || '%')
    ORDER BY "id" DESC
    LIMIT page_size OFFSET (page_number - 1) * page_size
  ) t;
  
  -- Contar total de registros
  SELECT COUNT(*) INTO total_count
  FROM "Aviso"
  WHERE 
    (search_query = '' OR 
     "titulo" ILIKE '%' || search_query || '%' OR 
     "conteudo" ILIKE '%' || search_query || '%' OR 
     "descricao" ILIKE '%' || search_query || '%');
  
  -- Verificar se há mais registros
  has_more := page_number * page_size < total_count;
  
  -- Retornar resultado
  RETURN json_build_object(
    'data', COALESCE(avisos_data, '[]'::JSON),
    'page', page_number,
    'pageSize', page_size,
    'total', total_count,
    'hasMore', has_more
  );
END;
$$ LANGUAGE plpgsql;

-- Função para buscar membros com paginação
CREATE OR REPLACE FUNCTION get_membros(page_number INTEGER DEFAULT 1, page_size INTEGER DEFAULT 10, search_query TEXT DEFAULT '')
RETURNS JSON AS $$
DECLARE
  membros_data JSON;
  total_count INTEGER;
  has_more BOOLEAN;
BEGIN
  -- Buscar membros com paginação e busca
  SELECT json_agg(row_to_json(t)) INTO membros_data
  FROM (
    SELECT * FROM "Membro"
    WHERE 
      (search_query = '' OR 
       "nome" ILIKE '%' || search_query || '%' OR 
       "endereco" ILIKE '%' || search_query || '%' OR 
       "telefone" ILIKE '%' || search_query || '%')
    ORDER BY "id" DESC
    LIMIT page_size OFFSET (page_number - 1) * page_size
  ) t;
  
  -- Contar total de registros
  SELECT COUNT(*) INTO total_count
  FROM "Membro"
  WHERE 
    (search_query = '' OR 
     "nome" ILIKE '%' || search_query || '%' OR 
     "endereco" ILIKE '%' || search_query || '%' OR 
     "telefone" ILIKE '%' || search_query || '%');
  
  -- Verificar se há mais registros
  has_more := page_number * page_size < total_count;
  
  -- Retornar resultado
  RETURN json_build_object(
    'data', COALESCE(membros_data, '[]'::JSON),
    'page', page_number,
    'pageSize', page_size,
    'total', total_count,
    'hasMore', has_more
  );
END;
$$ LANGUAGE plpgsql;

-- Função para buscar eventos com paginação
CREATE OR REPLACE FUNCTION get_eventos(page_number INTEGER DEFAULT 1, page_size INTEGER DEFAULT 10, search_query TEXT DEFAULT '')
RETURNS JSON AS $$
DECLARE
  eventos_data JSON;
  total_count INTEGER;
  has_more BOOLEAN;
BEGIN
  -- Buscar eventos com paginação e busca
  SELECT json_agg(row_to_json(t)) INTO eventos_data
  FROM (
    SELECT * FROM "Evento"
    WHERE 
      (search_query = '' OR 
       "titulo" ILIKE '%' || search_query || '%')
    ORDER BY "data" ASC
    LIMIT page_size OFFSET (page_number - 1) * page_size
  ) t;
  
  -- Contar total de registros
  SELECT COUNT(*) INTO total_count
  FROM "Evento"
  WHERE 
    (search_query = '' OR 
     "titulo" ILIKE '%' || search_query || '%');
  
  -- Verificar se há mais registros
  has_more := page_number * page_size < total_count;
  
  -- Retornar resultado
  RETURN json_build_object(
    'data', COALESCE(eventos_data, '[]'::JSON),
    'page', page_number,
    'pageSize', page_size,
    'total', total_count,
    'hasMore', has_more
  );
END;
$$ LANGUAGE plpgsql;

-- Função para buscar finanças com paginação
CREATE OR REPLACE FUNCTION get_financas(page_number INTEGER DEFAULT 1, page_size INTEGER DEFAULT 20, tipo_filter TEXT DEFAULT '')
RETURNS JSON AS $$
DECLARE
  financas_data JSON;
  total_count INTEGER;
  has_more BOOLEAN;
BEGIN
  -- Buscar finanças com paginação e filtro
  SELECT json_agg(row_to_json(t)) INTO financas_data
  FROM (
    SELECT * FROM "Financa"
    WHERE 
      (tipo_filter = '' OR "tipo" = tipo_filter)
    ORDER BY "data" DESC
    LIMIT page_size OFFSET (page_number - 1) * page_size
  ) t;
  
  -- Contar total de registros
  SELECT COUNT(*) INTO total_count
  FROM "Financa"
  WHERE 
    (tipo_filter = '' OR "tipo" = tipo_filter);
  
  -- Verificar se há mais registros
  has_more := page_number * page_size < total_count;
  
  -- Retornar resultado
  RETURN json_build_object(
    'data', COALESCE(financas_data, '[]'::JSON),
    'page', page_number,
    'pageSize', page_size,
    'total', total_count,
    'hasMore', has_more
  );
END;
$$ LANGUAGE plpgsql;

-- Função para buscar conteúdos com paginação
CREATE OR REPLACE FUNCTION get_conteudos(page_number INTEGER DEFAULT 1, page_size INTEGER DEFAULT 20, search_query TEXT DEFAULT '')
RETURNS JSON AS $$
DECLARE
  conteudos_data JSON;
  total_count INTEGER;
  has_more BOOLEAN;
BEGIN
  -- Buscar conteúdos com paginação e busca
  SELECT json_agg(row_to_json(t)) INTO conteudos_data
  FROM (
    SELECT * FROM "Conteudo"
    WHERE 
      (search_query = '' OR 
       "tipo" ILIKE '%' || search_query || '%' OR 
       "titulo" ILIKE '%' || search_query || '%')
    ORDER BY "data" DESC
    LIMIT page_size OFFSET (page_number - 1) * page_size
  ) t;
  
  -- Contar total de registros
  SELECT COUNT(*) INTO total_count
  FROM "Conteudo"
  WHERE 
    (search_query = '' OR 
     "tipo" ILIKE '%' || search_query || '%' OR 
     "titulo" ILIKE '%' || search_query || '%');
  
  -- Verificar se há mais registros
  has_more := page_number * page_size < total_count;
  
  -- Retornar resultado
  RETURN json_build_object(
    'data', COALESCE(conteudos_data, '[]'::JSON),
    'page', page_number,
    'pageSize', page_size,
    'total', total_count,
    'hasMore', has_more
  );
END;
$$ LANGUAGE plpgsql;

-- Função para buscar crachás com paginação
CREATE OR REPLACE FUNCTION get_crachas(page_number INTEGER DEFAULT 1, page_size INTEGER DEFAULT 20, origem_filter TEXT DEFAULT '')
RETURNS JSON AS $$
DECLARE
  crachas_data JSON;
  total_count INTEGER;
  has_more BOOLEAN;
BEGIN
  -- Buscar crachás com paginação e filtro
  SELECT json_agg(row_to_json(t)) INTO crachas_data
  FROM (
    SELECT * FROM "Cracha"
    WHERE 
      (origem_filter = '' OR "origem" = origem_filter)
    ORDER BY "id" DESC
    LIMIT page_size OFFSET (page_number - 1) * page_size
  ) t;
  
  -- Contar total de registros
  SELECT COUNT(*) INTO total_count
  FROM "Cracha"
  WHERE 
    (origem_filter = '' OR "origem" = origem_filter);
  
  -- Verificar se há mais registros
  has_more := page_number * page_size < total_count;
  
  -- Retornar resultado
  RETURN json_build_object(
    'data', COALESCE(crachas_data, '[]'::JSON),
    'page', page_number,
    'pageSize', page_size,
    'total', total_count,
    'hasMore', has_more
  );
END;
$$ LANGUAGE plpgsql;

-- Função para buscar embaixadores com paginação
CREATE OR REPLACE FUNCTION get_embaixadores(page_number INTEGER DEFAULT 1, page_size INTEGER DEFAULT 10, search_query TEXT DEFAULT '')
RETURNS JSON AS $$
DECLARE
  embaixadores_data JSON;
  total_count INTEGER;
  has_more BOOLEAN;
BEGIN
  -- Buscar embaixadores com paginação e busca
  SELECT json_agg(row_to_json(t)) INTO embaixadores_data
  FROM (
    SELECT * FROM "Embaixador"
    WHERE 
      (search_query = '' OR 
       "nome" ILIKE '%' || search_query || '%' OR 
       "telefone" ILIKE '%' || search_query || '%' OR 
       "pai" ILIKE '%' || search_query || '%' OR 
       "mae" ILIKE '%' || search_query || '%')
    ORDER BY "id" DESC
    LIMIT page_size OFFSET (page_number - 1) * page_size
  ) t;
  
  -- Contar total de registros
  SELECT COUNT(*) INTO total_count
  FROM "Embaixador"
  WHERE 
    (search_query = '' OR 
     "nome" ILIKE '%' || search_query || '%' OR 
     "telefone" ILIKE '%' || search_query || '%' OR 
     "pai" ILIKE '%' || search_query || '%' OR 
     "mae" ILIKE '%' || search_query || '%');
  
  -- Verificar se há mais registros
  has_more := page_number * page_size < total_count;
  
  -- Retornar resultado
  RETURN json_build_object(
    'data', COALESCE(embaixadores_data, '[]'::JSON),
    'page', page_number,
    'pageSize', page_size,
    'total', total_count,
    'hasMore', has_more
  );
END;
$$ LANGUAGE plpgsql;

-- Função para buscar templates
CREATE OR REPLACE FUNCTION get_templates(page_filter TEXT DEFAULT '', lado_filter TEXT DEFAULT '')
RETURNS JSON AS $$
DECLARE
  templates_data JSON;
BEGIN
  -- Buscar templates com filtros
  SELECT json_agg(row_to_json(t)) INTO templates_data
  FROM (
    SELECT * FROM "BadgeTemplate"
    WHERE 
      (page_filter = '' OR "page" = page_filter) AND
      (lado_filter = '' OR "lado" = lado_filter)
    ORDER BY "id" DESC
  ) t;
  
  -- Retornar resultado
  RETURN COALESCE(templates_data, '[]'::JSON);
END;
$$ LANGUAGE plpgsql;