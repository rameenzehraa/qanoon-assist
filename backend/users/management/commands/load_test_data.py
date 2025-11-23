# backend/users/management/commands/load_test_data.py
import os
import django
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import datetime, timedelta

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'qanoon_assist.settings')
django.setup()

from users.models import User, CitizenProfile, LawyerProfile, LawyerSpecialty, LawyerSpecialtyLink
from cases.models import CaseRequest, Case, Hearing, CaseUpdate
from messaging.models import Message
from knowledge_base.models import LegalCategory, LegalArticle

class Command(BaseCommand):
    help = 'Load comprehensive test data for Qanoon Assist'

    def handle(self, *args, **options):
        self.stdout.write('🚀 Loading Qanoon Assist test data...')
        
        # Check what data already exists and only create missing parts
        if not User.objects.exists():
            self.create_lawyer_specialties()
            self.create_users()
            self.create_citizen_profiles()
            self.create_lawyer_profiles()
            self.create_lawyer_specialty_links()
        else:
            self.stdout.write('✅ Users already exist, skipping user creation...')
        
        self.create_case_requests()
        self.create_cases()
        self.create_hearings()
        self.create_case_updates()
        self.create_messages()
        self.create_legal_categories()
        self.create_legal_articles()
        
        self.stdout.write(
            self.style.SUCCESS('✅ Successfully loaded all test data!')
        )
        self.print_summary()

    def create_lawyer_specialties(self):
        specialties = [
            {'name': 'Criminal Law', 'description': 'Defense and prosecution in criminal cases'},
            {'name': 'Family Law', 'description': 'Divorce, custody, inheritance, and family disputes'},
            {'name': 'Civil Law', 'description': 'Property disputes, contracts, and civil litigation'},
            {'name': 'Corporate Law', 'description': 'Business law, company formation, mergers'},
            {'name': 'Tax Law', 'description': 'Tax disputes, tax planning, and compliance'},
            {'name': 'Labor Law', 'description': 'Employment disputes, workers rights, labor contracts'},
            {'name': 'Constitutional Law', 'description': 'Constitutional matters and fundamental rights'},
            {'name': 'Property Law', 'description': 'Real estate, land disputes, property transactions'},
        ]
        
        for spec in specialties:
            LawyerSpecialty.objects.get_or_create(**spec)
        
        self.stdout.write(f'✅ Created {len(specialties)} lawyer specialties')

    def create_users(self):
        # Citizens
        citizens_data = [
            {'username': 'ali.khan', 'email': 'ali.khan@email.com', 'first_name': 'Ali', 'last_name': 'Khan'},
            {'username': 'fatima.ali', 'email': 'fatima.ali@email.com', 'first_name': 'Fatima', 'last_name': 'Ali'},
            {'username': 'ahmed.raza', 'email': 'ahmed.raza@email.com', 'first_name': 'Ahmed', 'last_name': 'Raza'},
            {'username': 'sara.malik', 'email': 'sara.malik@email.com', 'first_name': 'Sara', 'last_name': 'Malik'},
        ]
        
        for citizen_data in citizens_data:
            user, created = User.objects.get_or_create(
                username=citizen_data['username'],
                defaults={
                    'email': citizen_data['email'],
                    'first_name': citizen_data['first_name'],
                    'last_name': citizen_data['last_name'],
                    'password': 'password123',
                    'user_type': 'citizen',
                    'phone_number': '+923211234567'
                }
            )
            if created:
                user.set_password('password123')
                user.save()

        # Verified Lawyers
        verified_lawyers = [
            {'username': 'advocate.hassan', 'email': 'hassan@lawfirm.com', 'first_name': 'Hassan', 'last_name': 'Sheikh'},
            {'username': 'advocate.ayesha', 'email': 'ayesha@lawfirm.com', 'first_name': 'Ayesha', 'last_name': 'Siddiqui'},
            {'username': 'advocate.usman', 'email': 'usman@lawfirm.com', 'first_name': 'Usman', 'last_name': 'Ahmed'},
        ]
        
        for lawyer_data in verified_lawyers:
            user, created = User.objects.get_or_create(
                username=lawyer_data['username'],
                defaults={
                    'email': lawyer_data['email'],
                    'first_name': lawyer_data['first_name'],
                    'last_name': lawyer_data['last_name'],
                    'password': 'password123',
                    'user_type': 'lawyer',
                    'phone_number': '+923331234567'
                }
            )
            if created:
                user.set_password('password123')
                user.save()

        # Pending Verification Lawyers
        pending_lawyers = [
            {'username': 'advocate.zainab', 'email': 'zainab@lawfirm.com', 'first_name': 'Zainab', 'last_name': 'Tariq'},
            {'username': 'advocate.bilal', 'email': 'bilal@lawfirm.com', 'first_name': 'Bilal', 'last_name': 'Hussain'},
        ]
        
        for lawyer_data in pending_lawyers:
            user, created = User.objects.get_or_create(
                username=lawyer_data['username'],
                defaults={
                    'email': lawyer_data['email'],
                    'first_name': lawyer_data['first_name'],
                    'last_name': lawyer_data['last_name'],
                    'password': 'password123',
                    'user_type': 'lawyer',
                    'phone_number': '+923361234567'
                }
            )
            if created:
                user.set_password('password123')
                user.save()

        self.stdout.write(f'✅ Created {User.objects.count()} users')

    def create_citizen_profiles(self):
        citizens_data = [
            {'user__username': 'ali.khan', 'address': 'House 123, Block A, Gulshan-e-Iqbal', 'city': 'Karachi', 'cnic': '42101-1234567-1', 'date_of_birth': datetime(1990, 5, 15).date()},
            {'user__username': 'fatima.ali', 'address': 'Flat 45, DHA Phase 5', 'city': 'Karachi', 'cnic': '42101-2345678-2', 'date_of_birth': datetime(1988, 8, 20).date()},
            {'user__username': 'ahmed.raza', 'address': 'House 67, Model Town', 'city': 'Lahore', 'cnic': '35202-3456789-3', 'date_of_birth': datetime(1992, 3, 10).date()},
            {'user__username': 'sara.malik', 'address': 'Apartment 12, Bahria Town', 'city': 'Islamabad', 'cnic': '61101-4567890-4', 'date_of_birth': datetime(1995, 11, 25).date()},
        ]
        
        for data in citizens_data:
            username = data.pop('user__username')
            user = User.objects.get(username=username)
            CitizenProfile.objects.get_or_create(user=user, defaults=data)
        
        self.stdout.write(f'✅ Created {CitizenProfile.objects.count()} citizen profiles')

    def create_lawyer_profiles(self):
        # Verified Lawyers
        verified_lawyers = [
            {
                'user__username': 'advocate.hassan',
                'bar_council_number': 'KHI/2015/12345',
                'experience_years': 8,
                'consultation_fee': 5000.00,
                'is_verified': True,
                'bio': 'Experienced criminal defense lawyer with successful track record in high-profile cases.',
                'city': 'Karachi',
                'cnic': '42101-5678901-5',
                'address': 'Office 301, Legal Plaza, I.I. Chundrigar Road',
                'verification_date': timezone.now() - timedelta(days=30)
            },
            {
                'user__username': 'advocate.ayesha',
                'bar_council_number': 'KHI/2017/23456',
                'experience_years': 6,
                'consultation_fee': 4000.00,
                'is_verified': True,
                'bio': 'Expert in family law matters including divorce, custody disputes, and inheritance cases.',
                'city': 'Karachi',
                'cnic': '42101-6789012-6',
                'address': 'Suite 205, Tariq Road, PECHS',
                'verification_date': timezone.now() - timedelta(days=25)
            },
            {
                'user__username': 'advocate.usman',
                'bar_council_number': 'LHR/2012/34567',
                'experience_years': 11,
                'consultation_fee': 7000.00,
                'is_verified': True,
                'bio': 'Senior advocate specializing in property disputes, civil litigation, and corporate matters.',
                'city': 'Lahore',
                'cnic': '35202-7890123-7',
                'address': 'Chamber 15, High Court Bar Association, Lahore',
                'verification_date': timezone.now() - timedelta(days=20)
            },
        ]
        
        for data in verified_lawyers:
            username = data.pop('user__username')
            user = User.objects.get(username=username)
            LawyerProfile.objects.get_or_create(user=user, defaults=data)
        
        # Pending Verification Lawyers
        pending_lawyers = [
            {
                'user__username': 'advocate.zainab',
                'bar_council_number': 'ISB/2019/45678',
                'experience_years': 4,
                'consultation_fee': 3500.00,
                'is_verified': False,
                'bio': 'Young and energetic lawyer focusing on constitutional law and human rights cases.',
                'city': 'Islamabad',
                'cnic': '61101-8901234-8',
                'address': 'Office 12, F-7 Markaz',
            },
            {
                'user__username': 'advocate.bilal',
                'bar_council_number': 'KHI/2020/56789',
                'experience_years': 3,
                'consultation_fee': 3000.00,
                'is_verified': False,
                'bio': 'Recently enrolled advocate with expertise in labor law and employment disputes.',
                'city': 'Karachi',
                'cnic': '42101-9012345-9',
                'address': 'Office 8, Saddar Town',
            },
        ]
        
        for data in pending_lawyers:
            username = data.pop('user__username')
            user = User.objects.get(username=username)
            LawyerProfile.objects.get_or_create(user=user, defaults=data)
        
        self.stdout.write(f'✅ Created {LawyerProfile.objects.count()} lawyer profiles')

    def create_lawyer_specialty_links(self):
        specialties = {
            'advocate.hassan': ['Criminal Law', 'Corporate Law'],
            'advocate.ayesha': ['Family Law', 'Civil Law'],
            'advocate.usman': ['Civil Law', 'Property Law', 'Corporate Law'],
            'advocate.zainab': ['Constitutional Law'],
            'advocate.bilal': ['Labor Law'],
        }
        
        for username, specialty_names in specialties.items():
            lawyer_profile = LawyerProfile.objects.get(user__username=username)
            for specialty_name in specialty_names:
                specialty = LawyerSpecialty.objects.get(name=specialty_name)
                LawyerSpecialtyLink.objects.get_or_create(
                    lawyer=lawyer_profile,
                    specialty=specialty
                )
        
        self.stdout.write(f'✅ Created {LawyerSpecialtyLink.objects.count()} specialty links')

    def create_case_requests(self):
        # Get citizen profiles (not User objects)
        ali_profile = CitizenProfile.objects.get(user__username='ali.khan')
        fatima_profile = CitizenProfile.objects.get(user__username='fatima.ali')
        ahmed_profile = CitizenProfile.objects.get(user__username='ahmed.raza')
        sara_profile = CitizenProfile.objects.get(user__username='sara.malik')
        
        # Get lawyer profiles
        hassan_profile = LawyerProfile.objects.get(user__username='advocate.hassan')
        ayesha_profile = LawyerProfile.objects.get(user__username='advocate.ayesha')
        usman_profile = LawyerProfile.objects.get(user__username='advocate.usman')
        
        case_requests = [
            {
                'requester': ali_profile,
                'lawyer': hassan_profile,
                'case_title': 'Fraud Case Defense',
                'case_type': 'Criminal',
                'description': 'I have been falsely accused of fraud by my business partner. Need immediate legal assistance.',
                'urgency': 'urgent',
                'status': 'in_progress',
                'request_date': timezone.now() - timedelta(days=15),
                'response_message': 'I have reviewed your case and will represent you. Please bring all relevant documents.',
                'response_date': timezone.now() - timedelta(days=14),
            },
            {
                'requester': fatima_profile,
                'lawyer': ayesha_profile,
                'case_title': 'Divorce Proceedings',
                'case_type': 'Family',
                'description': 'Need assistance with filing for divorce. Have been separated for 2 years.',
                'urgency': 'high',
                'status': 'in_progress',
                'request_date': timezone.now() - timedelta(days=10),
                'response_message': 'I specialize in such cases. We can schedule a consultation.',
                'response_date': timezone.now() - timedelta(days=9),
            },
            {
                'requester': ahmed_profile,
                'lawyer': usman_profile,
                'case_title': 'Property Dispute',
                'case_type': 'Civil',
                'description': 'Dispute with neighbor over land boundaries. Need to file a case.',
                'urgency': 'medium',
                'status': 'accepted',
                'request_date': timezone.now() - timedelta(days=5),
                'response_message': 'Will help you resolve this matter. Please provide property documents.',
                'response_date': timezone.now() - timedelta(days=4),
            },
            {
                'requester': sara_profile,
                'lawyer': hassan_profile,
                'case_title': 'Theft Case',
                'case_type': 'Criminal',
                'description': 'My shop was robbed. Need legal guidance to file FIR and pursue case.',
                'urgency': 'high',
                'status': 'pending',
                'request_date': timezone.now() - timedelta(days=2),
            },
        ]
        
        for case_data in case_requests:
            CaseRequest.objects.get_or_create(
                requester=case_data['requester'],
                lawyer=case_data['lawyer'],
                case_title=case_data['case_title'],
                defaults=case_data
            )
        
        self.stdout.write(f'✅ Created {CaseRequest.objects.count()} case requests')

    def create_cases(self):
        case_requests = CaseRequest.objects.filter(status__in=['in_progress', 'accepted'])
        
        for i, case_request in enumerate(case_requests, 1):
            # Get the citizen profile from the case request requester
            citizen_profile = case_request.requester  # This is already a CitizenProfile
            
            Case.objects.get_or_create(
                case_request=case_request,
                defaults={
                    'citizen': citizen_profile,  # Use CitizenProfile, not User
                    'lawyer': case_request.lawyer,
                    'title': case_request.case_title,
                    'description': case_request.description,
                    'case_number': f'QA-2025-{1000 + i}',
                    'filing_date': case_request.response_date,
                    'status': 'active'
                }
            )
        
        self.stdout.write(f'✅ Created {Case.objects.count()} cases')

    def create_hearings(self):
        cases = Case.objects.all()
        
        if cases.exists():
            hearings_data = [
                {
                    'case': cases[0],
                    'title': 'Initial Hearing',
                    'hearing_date': timezone.now() + timedelta(days=5),
                    'location': 'City Courts, Karachi - Court Room 5',
                    'notes': 'Bring all financial documents and witness statements',
                    'next_date': timezone.now() + timedelta(days=25),
                },
                {
                    'case': cases[1],
                    'title': 'Mediation Session',
                    'hearing_date': timezone.now() + timedelta(days=10),
                    'location': 'Family Court, Karachi - Mediation Room 2',
                    'notes': 'Both parties to attend for settlement discussion',
                    'next_date': timezone.now() + timedelta(days=30),
                },
            ]
            
            for hearing_data in hearings_data:
                Hearing.objects.get_or_create(
                    case=hearing_data['case'],
                    title=hearing_data['title'],
                    defaults=hearing_data
                )
        
        self.stdout.write(f'✅ Created {Hearing.objects.count()} hearings')

    def create_case_updates(self):
        cases = Case.objects.all()
        
        if cases.exists():
            # Get User objects for lawyers, not LawyerProfile objects
            lawyer_users = User.objects.filter(user_type='lawyer')
            
            updates_data = [
                {'case': cases[0], 'title': 'Case Filed Successfully', 'description': 'Formal case has been filed in City Courts.', 'created_by': lawyer_users[0]},
                {'case': cases[0], 'title': 'Initial Documents Submitted', 'description': 'All relevant financial documents submitted to court.', 'created_by': lawyer_users[0]},
                {'case': cases[1], 'title': 'Divorce Petition Filed', 'description': 'Divorce petition filed under mutual consent.', 'created_by': lawyer_users[1]},
            ]
            
            for i, update_data in enumerate(updates_data, 1):
                CaseUpdate.objects.get_or_create(
                    case=update_data['case'],
                    title=update_data['title'],
                    defaults={
                        'description': update_data['description'],
                        'created_by': update_data['created_by'],  # User instance
                        'created_at': timezone.now() - timedelta(days=10 - i)
                    }
                )
        
        self.stdout.write(f'✅ Created {CaseUpdate.objects.count()} case updates')

    def create_messages(self):
        case_requests = CaseRequest.objects.all()
        
        if case_requests.exists():
            users = User.objects.all()
            
            messages_data = [
                {'case_request': case_requests[0], 'sender': users[1], 'content': 'I urgently need your help with this fraud case.', 'is_read': True},
                {'case_request': case_requests[0], 'sender': users[5], 'content': 'Yes, I can meet tomorrow at 2 PM at my office.', 'is_read': True},
                {'case_request': case_requests[1], 'sender': users[2], 'content': 'I want to file for divorce.', 'is_read': True},
                {'case_request': case_requests[1], 'sender': users[6], 'content': 'I understand. Is this a mutual decision or contested?', 'is_read': True},
            ]
            
            for i, message_data in enumerate(messages_data, 1):
                Message.objects.get_or_create(
                    case_request=message_data['case_request'],
                    sender=message_data['sender'],
                    content=message_data['content'],
                    defaults={
                        'timestamp': timezone.now() - timedelta(days=10 - i),
                        'is_read': message_data['is_read']
                    }
                )
        
        self.stdout.write(f'✅ Created {Message.objects.count()} messages')

    def create_legal_categories(self):
        categories = [
            {
                'name': 'Criminal Law', 
                'description': 'Laws relating to crimes, offenses, and punishments including Pakistan Penal Code, Anti-Terrorism Act, etc.'
            },
            {
                'name': 'Constitutional Law', 
                'description': 'Laws relating to the Constitution of Pakistan, fundamental rights, and state structure'
            },
            {
                'name': 'Family Law', 
                'description': 'Laws relating to marriage, divorce, inheritance, child custody, and family matters'
            },
            {
                'name': 'Civil Law', 
                'description': 'Laws relating to civil disputes, contracts, property, torts, and civil litigation'
            },
            {
                'name': 'Corporate Law', 
                'description': 'Laws relating to business, companies, commercial transactions, and corporate governance'
            },
            {
                'name': 'Labor Law', 
                'description': 'Laws relating to employment, workers rights, labor disputes, and industrial relations'
            },
            {
                'name': 'Property Law', 
                'description': 'Laws relating to real estate, land disputes, property transactions, and ownership rights'
            },
            {
                'name': 'Tax Law', 
                'description': 'Laws relating to taxation, tax disputes, tax planning, and compliance matters'
            },
        ]
        
        for category_data in categories:
            LegalCategory.objects.get_or_create(
                name=category_data['name'],
                defaults=category_data
            )
        
        self.stdout.write(f'✅ Created {LegalCategory.objects.count()} legal categories')

    def create_legal_articles(self):
        # Get categories
        criminal_law = LegalCategory.objects.get(name='Criminal Law')
        constitutional_law = LegalCategory.objects.get(name='Constitutional Law')
        family_law = LegalCategory.objects.get(name='Family Law')
        civil_law = LegalCategory.objects.get(name='Civil Law')
        corporate_law = LegalCategory.objects.get(name='Corporate Law')
        labor_law = LegalCategory.objects.get(name='Labor Law')
        property_law = LegalCategory.objects.get(name='Property Law')
        tax_law = LegalCategory.objects.get(name='Tax Law')
        
        articles_data = [
            # Criminal Law Articles
            {
                'article_number': 'Section 302 PPC',
                'title': 'Punishment for Qatl-e-Amd (Murder)',
                'category': criminal_law,
                'content': 'Whoever commits qatl-e-amd shall be punished with death as qisas, or imprisonment for life as tazir having regard to the facts and circumstances of the case, or imprisonment of either description for a term which may extend to twenty-five years.',
                'keywords': 'murder, qatl-e-amd, death penalty, capital punishment, homicide, killing'
            },
            {
                'article_number': 'Section 420 PPC',
                'title': 'Cheating and Dishonestly Inducing Delivery of Property',
                'category': criminal_law,
                'content': 'Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, or anything which is signed or sealed, and which is capable of being converted into a valuable security, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.',
                'keywords': 'cheating, fraud, deception, property, 420, scam, dishonesty'
            },
            {
                'article_number': 'Section 376 PPC',
                'title': 'Punishment for Rape',
                'category': criminal_law,
                'content': 'Whoever commits rape shall be punished with death or imprisonment of either description for a term which shall not be less than ten years or more than twenty-five years and shall also be liable to fine.',
                'keywords': 'rape, sexual assault, women protection, crime, punishment'
            },
            {
                'article_number': 'Section 382 PPC',
                'title': 'Theft after Preparation Made for Causing Death or Hurt',
                'category': criminal_law,
                'content': 'Whoever commits theft, having made preparation for causing death, or hurt, or restraint, or fear of death, or of hurt, or of restraint, to any person, in order to the committing of such theft, or in order to the effecting of his escape after the committing of such theft, or in order to the retaining of property taken by such theft, shall be punished with rigorous imprisonment for a term which may extend to ten years, and shall also be liable to fine.',
                'keywords': 'theft, robbery, dacoity, property crime, punishment'
            },
            
            # Constitutional Law Articles
            {
                'article_number': 'Article 25 Constitution',
                'title': 'Equality of Citizens',
                'category': constitutional_law,
                'content': 'All citizens are equal before law and are entitled to equal protection of law. There shall be no discrimination on the basis of sex alone. Nothing in this Article shall prevent the State from making any special provision for the protection of women and children.',
                'keywords': 'equality, fundamental rights, discrimination, gender equality, equal protection'
            },
            {
                'article_number': 'Article 9 Constitution',
                'title': 'Security of Person',
                'category': constitutional_law,
                'content': 'No person shall be deprived of life or liberty save in accordance with law.',
                'keywords': 'life, liberty, fundamental rights, personal freedom, security'
            },
            {
                'article_number': 'Article 10 Constitution',
                'title': 'Safeguards as to Arrest and Detention',
                'category': constitutional_law,
                'content': 'No person who is arrested shall be detained in custody without being informed, as soon as may be, of the grounds for such arrest, nor shall he be denied the right to consult and be defended by a legal practitioner of his choice.',
                'keywords': 'arrest, detention, legal rights, lawyer, custody, fundamental rights'
            },
            {
                'article_number': 'Article 19 Constitution',
                'title': 'Freedom of Speech',
                'category': constitutional_law,
                'content': 'Every citizen shall have the right to freedom of speech and expression, and there shall be freedom of the press, subject to any reasonable restrictions imposed by law in the interest of the glory of Islam or the integrity, security or defence of Pakistan or any part thereof, friendly relations with foreign States, public order, decency or morality, or in relation to contempt of court, commission of or incitement to an offence.',
                'keywords': 'freedom of speech, expression, press freedom, fundamental rights'
            },
            
            # Family Law Articles
            {
                'article_number': 'Section 4 MFLO',
                'title': 'Registration of Marriages',
                'category': family_law,
                'content': 'Every marriage solemnized under Muslim Law shall be registered in accordance with the provisions of this Ordinance. The Union Council shall register marriages contracted within its jurisdiction and shall issue marriage registration certificates.',
                'keywords': 'marriage, nikah, registration, union council, Muslim law'
            },
            {
                'article_number': 'Section 7 MFLO',
                'title': 'Talaq (Divorce) Procedure',
                'category': family_law,
                'content': 'Any man who wishes to divorce his wife shall, as soon as may be after the pronouncement of talaq in any form whatsoever, give the Chairman notice in writing of his having done so, and shall supply a copy thereof to the wife. The talaq shall not be effective until the expiration of ninety days from the day on which notice under sub-section (1) is delivered to the Chairman.',
                'keywords': 'divorce, talaq, separation, family law, Muslim law'
            },
            {
                'article_number': 'Section 5 MFLO',
                'title': 'Polygamy Restrictions',
                'category': family_law,
                'content': 'No man, during the subsistence of an existing marriage, shall, except with the previous permission in writing of the Arbitration Council, contract another marriage, nor shall any such marriage contracted without such permission be registered under this Ordinance.',
                'keywords': 'polygamy, multiple marriages, arbitration council, permission'
            },
            
            # Civil Law Articles
            {
                'article_number': 'Section 73 Contract Act',
                'title': 'Compensation for Loss or Damage',
                'category': civil_law,
                'content': 'When a contract has been broken, the party who suffers by such breach is entitled to receive, from the party who has broken the contract, compensation for any loss or damage caused to him thereby, which naturally arose in the usual course of things from such breach, or which the parties knew, when they made the contract, to be likely to result from the breach of it.',
                'keywords': 'contract, breach, compensation, damages, civil law'
            },
            {
                'article_number': 'Section 23 Contract Act',
                'title': 'What Considerations and Objects are Lawful',
                'category': civil_law,
                'content': 'The consideration or object of an agreement is lawful, unless— it is forbidden by law; or is of such a nature that, if permitted, it would defeat the provisions of any law; or is fraudulent; or involves or implies injury to the person or property of another; or the Court regards it as immoral, or opposed to public policy.',
                'keywords': 'contract, consideration, lawful, unlawful, agreement'
            },
            
            # Corporate Law Articles
            {
                'article_number': 'Section 90 Companies Act',
                'title': 'Appointment of Directors',
                'category': corporate_law,
                'content': 'Every public company shall have at least seven directors and every private company shall have at least two directors. The directors shall be appointed by the company in general meeting.',
                'keywords': 'directors, appointment, companies act, corporate governance'
            },
            
            # Labor Law Articles
            {
                'article_number': 'Section 11 Industrial Relations Act',
                'title': 'Registration of Trade Unions',
                'category': labor_law,
                'content': 'Any seven or more workers of an establishment may form a trade union and apply for registration. The Registrar shall register the trade union if he is satisfied that the trade union has complied with the provisions of this Act.',
                'keywords': 'trade union, registration, workers rights, labor law'
            },
            
            # Property Law Articles
            {
                'article_number': 'Section 54 Transfer of Property Act',
                'title': 'Sale Defined',
                'category': property_law,
                'content': 'Sale is a transfer of ownership in exchange for a price paid or promised or part-paid and part-promised. Such transfer, in the case of tangible immovable property of the value of one hundred rupees and upwards, can be made only by a registered instrument.',
                'keywords': 'sale, property transfer, ownership, registered instrument'
            },
            
            # Tax Law Articles
            {
                'article_number': 'Section 148 Income Tax Ordinance',
                'title': 'Advance Tax on Salary',
                'category': tax_law,
                'content': 'Every person responsible for paying any income chargeable under the head "Salary" shall, at the time of payment, deduct tax at the rate specified in Division I of Part III of the First Schedule.',
                'keywords': 'income tax, salary, advance tax, deduction'
            },
        ]
        
        for article_data in articles_data:
            article, created = LegalArticle.objects.get_or_create(
                article_number=article_data['article_number'],
                defaults=article_data
            )
            if created:
                self.stdout.write(f'   ✅ Created article: {article_data["article_number"]} - {article_data["title"]}')
        
        self.stdout.write(f'✅ Created {LegalArticle.objects.count()} legal articles')

    def print_summary(self):
        self.stdout.write('\n📊 DATA SUMMARY:')
        self.stdout.write(f'   👥 Users: {User.objects.count()}')
        self.stdout.write(f'   👨‍⚖️ Lawyers: {LawyerProfile.objects.count()}')
        self.stdout.write(f'   👨‍💼 Citizens: {CitizenProfile.objects.count()}')
        self.stdout.write(f'   📋 Case Requests: {CaseRequest.objects.count()}')
        self.stdout.write(f'   ⚖️ Cases: {Case.objects.count()}')
        self.stdout.write(f'   📅 Hearings: {Hearing.objects.count()}')
        self.stdout.write(f'   💬 Messages: {Message.objects.count()}')
        self.stdout.write(f'   📚 Legal Categories: {LegalCategory.objects.count()}')
        self.stdout.write(f'   📖 Legal Articles: {LegalArticle.objects.count()}')
        
        self.stdout.write('\n🔑 TEST CREDENTIALS:')
        self.stdout.write('   Citizens:')
        self.stdout.write('     ali.khan / password123')
        self.stdout.write('     fatima.ali / password123')
        self.stdout.write('   Lawyers:')
        self.stdout.write('     advocate.hassan / password123 (Verified)')
        self.stdout.write('     advocate.zainab / password123 (Pending)')