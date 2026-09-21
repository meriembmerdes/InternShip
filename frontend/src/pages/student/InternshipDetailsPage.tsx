import { useEffect,useState } from 'react';
import { useNavigate,useParams } from 'react-router-dom';
import { internshipService,type Internship } from '../../services/internshipService';
import { applicationService } from '../../services/applicationService';

export default function InternshipDetailsPage(){
 const {id}=useParams();
 const navigate=useNavigate();
 const [internship,setInternship]=useState<Internship|null>(null);
 const [motivationMessage,setMotivationMessage]=useState('');
 const [loading,setLoading]=useState(true);
 const [sending,setSending]=useState(false);
 const [message,setMessage]=useState('');

 useEffect(()=>{
  if(!id)return;
  internshipService.getById(id).then(setInternship).catch(()=>setMessage('Impossible de charger cette offre')).finally(()=>setLoading(false));
 },[id]);

 const handleApply=async()=>{
  if(!id)return;
  setSending(true);
  setMessage('');
  try{
   await applicationService.create({internshipId:id,motivationMessage});
   setMessage('Votre candidature a été envoyée avec succès.');
   setTimeout(()=>navigate('/student/applications'),1000);
  }catch(error:any){
   setMessage(error?.response?.data?.message||'Impossible d’envoyer la candidature');
  }finally{
   setSending(false);
  }
 };

 if(loading)return <div className="p-6">Chargement...</div>;
 if(!internship)return <div className="p-6">Offre introuvable.</div>;

 return(
  <div className="p-6 max-w-4xl mx-auto">
   <button onClick={()=>navigate(-1)} className="mb-6">← Retour</button>
   <div className="bg-white rounded-xl shadow p-6">
    <h1 className="text-3xl font-bold mb-2">{internship.title}</h1>
    <p className="text-gray-500 mb-6">{internship.domain}</p>
    <div className="grid md:grid-cols-2 gap-4 mb-6">
     <div><strong>Durée :</strong> {internship.duration||'Non précisée'}</div>
     <div><strong>Lieu :</strong> {internship.location||'Non précisé'}</div>
     <div><strong>Places :</strong> {internship.numberOfPlaces}</div>
     <div><strong>Statut :</strong> {internship.status}</div>
    </div>
    <h2 className="text-xl font-semibold mb-2">Description</h2>
    <p className="mb-6 whitespace-pre-line">{internship.description}</p>
    <h2 className="text-xl font-semibold mb-2">Message de motivation</h2>
    <textarea value={motivationMessage} onChange={e=>setMotivationMessage(e.target.value)} rows={6} className="w-full border rounded-lg p-3 mb-4" placeholder="Présentez brièvement votre motivation..." />
    {message&&<div className="mb-4 p-3 rounded-lg bg-gray-100">{message}</div>}
    <button onClick={handleApply} disabled={sending} className="px-6 py-3 rounded-lg bg-blue-600 text-white disabled:opacity-50">
     {sending?'Envoi...':'Postuler à cette offre'}
    </button>
   </div>
  </div>
 );
}