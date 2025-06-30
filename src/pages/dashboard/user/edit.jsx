import { Helmet } from 'react-helmet-async';
import { useParams } from 'src/routes/hooks';
import { UserEditView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function UserEditPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> Dashboard: User Edit</title>
      </Helmet>

      <UserEditView id={`${id}`} />
    </>
  );
}
